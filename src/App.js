import React, { Component } from 'react';
import { SparqlClient } from 'sparql-client-2';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import injectTapEventPlugin from 'react-tap-event-plugin';
import MaterialDrawer from 'material-ui/Drawer/Drawer';
import Card from 'material-ui/Card/Card';
import CardHeader from 'material-ui/Card/CardHeader';
import CardText from 'material-ui/Card/CardText';
import FlatButton from 'material-ui/FlatButton/';
import AppBar from 'material-ui/AppBar/';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import SparqlJs from 'sparqljs';
import Markdown from 'react-markdown';
import Subheader from 'material-ui/Subheader';
import {
  green400,
  green500,
  green700,
  orangeA200,
} from 'material-ui/styles/colors';
import IconButton from 'material-ui/IconButton';
import Divider from 'material-ui/Divider';
import PropTypes from 'prop-types';
import './App.css';
import DataCreation from './DataCreation';
import Tutorialised from './Tutorialised';
import DataBrowser from './DataBrowser';
import QueryWriter from './QueryWriter';

// import {MdCode,MdSearch,MdCreate,MdBook} from 'react-icons/md';
// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();
const muiTheme = getMuiTheme({
  palette: {
    primary1Color: green500,
    primary2Color: green700,
    primary3Color: green400,
    accent1Color: orangeA200,
  },
});
const States = {
  Welcome: 1,
  DataCreation: 2,
  DataBrowsing: 3,
  Querying: 4,
  Tutorialise: 5,
  AboutTool: 6,
  AboutLD: 7,
  AboutLODC: 9,
  AboutLOV: 10,
};

function NavigationBar(props) {
  return (
    <MaterialDrawer>
      <Card>
        <CardHeader
          title="LinkDaLe"
          subtitle="Linked Data Learning environment"
          textStyle={{ paddingRight: '0px' }}
        />
        <CardText>
          <img src={`${process.env.PUBLIC_URL}/images/rdf.png`} height={80} alt="logo" />
        </CardText>
      </Card>
      <div style={{ textAlign: 'left' }}>
        <FlatButton
          label="Create Linked Data"
          fullWidth
          onClick={() => props.onClick(States.DataCreation)}
        />
        <FlatButton
          label="Browse Data"
          fullWidth
          onClick={() => props.onClick(States.DataBrowsing)}
        />
        <FlatButton
          label="Query Data"
          fullWidth
          onClick={() => props.onClick(States.Querying)}
        />
        <FlatButton
          label="Tutorial"
          fullWidth
          onClick={() => props.onClick(States.Tutorialise)}
        />
        <Divider />
        <Subheader inset >About</Subheader>
        <FlatButton
          label="The tool"
          fullWidth
          onClick={() => props.onClick(States.AboutTool)}
        />
        <FlatButton
          label="Linked Data"
          fullWidth
          onClick={() => props.onClick(States.AboutLD)}
        />
        <FlatButton
          label="Linked Open Data Cloud"
          fullWidth
          onClick={() => props.onClick(States.AboutLODC)}
        />
        <FlatButton
          label="Linked Open Vocabularies"
          fullWidth
          onClick={() => props.onClick(States.AboutLOV)}
        />

        <Divider />
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          width: '100%',

        }}
      >
        <Divider />
        <IconButton
          iconClassName="muidocs-icon-custom-github"
          href="https://github.com/GerwinBosch/rdf-paqt"
        />
      </div>
    </MaterialDrawer>
  );
}

NavigationBar.propTypes = {
  onClick: PropTypes.func.isRequired,
};

class App extends Component {
  constructor() {
    super();
    this.state = {
      state: States.Welcome,
      title: 'Welcome',
      client: new SparqlClient('http://almere.pilod.nl:8890/sparql'),
      parser: new SparqlJs.Parser(),
    };
  }
  executeSparql = (call, callBack) => {
    console.info('call', call);
    try {
      this.state.parser.parse(call);
      this.state.client.query(call).execute((err, results) => {
        if (err) {
          if (callBack) {
            callBack(err, []);
          }
        } else if (callBack) {
          console.info('results', results);
          callBack('', results.results.bindings);
        }
      });
    } catch (error) {
      callBack(error, null);
    }
  };

  handleClick = (i) => {
    let title;
    let link = '';
    if (this.state === i) {
      return;
    }
    switch (i) {
      case (States.Welcome) :
        title = 'Welcome';
        break;
      case (States.DataCreation):
        title = 'Create Linked Data';
        break;
      case (States.DataBrowsing):
        title = 'Browse data';
        break;
      case (States.Querying):
        title = 'Query data';
        break;
      case (States.Tutorialise):
        title = 'Tutorials';
        break;
      case (States.AboutTool):
        title = 'About the tool';
        link = `${process.env.PUBLIC_URL}/markdown/AboutTool.MD`;
        break;
      case (States.AboutLD):
        title = 'About Linked Data';
        link = `${process.env.PUBLIC_URL}/markdown/AboutLD.MD`;
        break;
      case (States.AboutLODC):
        title = 'About Linked Open Data Cloud';
        link = `${process.env.PUBLIC_URL}/markdown/AboutLOD.MD`;
        break;
      case (States.AboutLOV):
        title = 'About Linked Open Vocabulary';
        link = `${process.env.PUBLIC_URL}/markdown/AboutTool.MD`;
        break;
      default:
        title = 'Welcome';
    }
    if (link) {
      fetch(link).then(
        result => result.text()).then(
        body => this.setState({
          markdownText: body,
        }),
      );
    }
    this.setState({
      state: i,
      title,
    });
  };


  renderContent = () => {
    switch (this.state.state) {
      case States.DataCreation:
        return <DataCreation executeQuery={this.executeSparql} />;
      case States.DataBrowsing:
        return <DataBrowser executeQuery={this.executeSparql} />;
      case States.Querying:
        return (<QueryWriter
          executeQuery={this.executeSparql}
        />);
      case States.Tutorialise:
        return <Tutorialised />;
      case States.AboutLOV:
      case States.AboutLODC:
      case States.AboutTool:
      case States.AboutLD:

        return (
          <div style={{ display: 'flex', flexDirection: 'row' }}>
            <space style={{ flex: 1 }} />
            <div style={{ textStyle: 'roboto, sans-serif', textAlign: 'left', flex: 3, width: '60%' }}>
              <Markdown source={this.state.markdownText} />
            </div>
            <space style={{ flex: 1 }} />
          </div>
        );
      default:
        return (
          <div>
            <Markdown source={'# Hello'} />
          </div>

        );
    }
  };

  render() {
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <div className="App">
          <NavigationBar
            onClick={i => this.handleClick(i)}
          />
          <div style={{ paddingLeft: 256 }}>
            <AppBar
              title={this.state.title}
              // iconClassNameRight="muidocs-icon-navigation-expand-more"
            />
            {
              this.renderContent()
            }
          </div>
        </div>
      </MuiThemeProvider>
    );
  }
}

export default App;
