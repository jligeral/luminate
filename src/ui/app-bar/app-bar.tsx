import { Help} from '@mui/icons-material';
import { Tooltip, AppBar, Toolbar} from "@mui/material"
import { ApiInputModal } from './api-input';
import { ContactModal } from './contact';
import { startTutorial } from '../../util/util';
import './app-bar.scss';

export const ApplicationBar = () => {

  return (
    <div className="app-bar-container">
      <AppBar position="relative" elevation={0} sx={{ flexGrow: 1, backgroundColor: "#FFF" , height: '64px', zIndex:10000}}>
        <Toolbar id="tool-bar" sx={{ flexGrow: 1, height: '100%', minHeight: '100%', alignItems: 'center', justifyContent: 'flex-end'}}>
          <Tooltip title="Tutorial">
              <button className="appbar-item" onClick={startTutorial}>
                <Help style={{color: '#aaa'}} />
              </button>
          </Tooltip>
          <ContactModal />
          <ApiInputModal />
        </Toolbar>
      </AppBar>
    </div>
  );
};