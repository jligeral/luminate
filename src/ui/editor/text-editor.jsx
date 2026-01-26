import { useEffect, useRef } from "react";

import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import ImageTool from "@editorjs/image";
// import Code from "@editorjs/code";

import AiTool from "./ai-tool";
import AiInlineTool from "./inline-ai-tool";

import useEditorStore from "../../store/use-editor-store";
import useResponseStore from "../../store/use-response-store";
import { upload } from '@vercel/blob/client';

export default function Editor() {
  const ejInstance = useRef();
  const { setContext } = useResponseStore();

  const getEditorInstance = () => ejInstance.current;

  useEffect(() => {
    if (!ejInstance.current) {
      initEditor();
      ejInstance.current = getEditorInstance();
      useEditorStore.setState({ api: ejInstance.current });
    }

    return () => {
      ejInstance.current?.destroy?.();
      ejInstance.current = null;
    };
  }, []);

  const uploadImageFile = async (file) => {
    const blob = await upload(file.name, file, {
      access: 'public',
      handleUploadUrl: '/api/blob/upload',
    })

    return { success: 1, file: { url: blob.url } }
  }

  const uploadImageByUrl = async (url) => {
    const res = await fetch("/api/uploads/image-by-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Upload-by-URL failed (${res.status}). ${text}`);
    }

    const data = await res.json();
    if (!data?.success || !data?.file?.url) {
      throw new Error("Upload-by-URL response missing { success:1, file:{url} }");
    }
    return data;
  };

  const initEditor = () => {
    const editor = new EditorJS({
      holder: "text-editor",
      tools: {
        AiTool: {
          class: AiTool,
          inlineToolbar: true,
        },
        header: {
          class: Header,
          inlineToolbar: true,
        },
        list: {
          class: List,
          inlineToolbar: true,
        },
        image: {
          class: ImageTool,
          inlineToolbar: false,
          config: {
            uploader: {
              uploadByFile: async (file) => {
                try {
                  return await uploadImageFile(file);
                } catch (e) {
                  console.error(e);
                  // EditorJS expects success:0 on failure
                  return { success: 0 };
                }
              },
              uploadByUrl: async (url) => {
                try {
                  return await uploadImageByUrl(url);
                } catch (e) {
                  console.error(e);
                  return { success: 0 };
                }
              },
            },
          },
        },
        AddContext: {
          class: AiInlineTool,
          shortcut: "CMD+M",
        },
      },
      placeholder: "Click here to write down the title",
      data: { blocks: [] },
    });

    ejInstance.current = editor;
  };

  const handleSelectionChange = () => {
    const selection = document.getSelection();
    if (
      selection &&
      selection.toString().trim().length > 0 &&
      selection.anchorNode &&
      (selection.anchorNode.parentElement || selection.anchorNode.parentElement?.offsetParent)
    ) {
      const classNames = selection.anchorNode.parentElement.className;
      const offsetClassNames = selection.anchorNode.parentElement.offsetParent?.className ?? "";
      if (classNames.includes("ce-") || offsetClassNames.includes("ce-")) {
        setContext(selection.toString().trim());
      } else {
        setContext("");
      }
    }
  };

  return <div id="text-editor" onMouseUp={handleSelectionChange} />;
}
