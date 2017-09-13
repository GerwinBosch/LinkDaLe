/* eslint-disable react/jsx-no-bind,react/jsx-filename-extension */
/**
 * Created by theli on 8/9/2017.
 */
import 'whatwg-fetch';
import React from 'react';
import {
  Card,
  CardActions,
  CardMedia,
  CardTitle,
  CardText,
} from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import Dialog from 'material-ui/Dialog';
import Markdown from 'react-markdown';
import { green500 } from 'material-ui/styles/colors';
import './Tutorialised.css';


class Tutorialised extends React.Component {
  constructor() {
    super();
    this.state = {
      markdownText: '#NO MARKDOWN LOADED',
      dialogOpen: false,
      tutorials:
      {
        1: {
          expanded: false,
          markdownURIs:
          [
            `${process.env.PUBLIC_URL}/markdown/AboutTool.MD`,
            `${process.env.PUBLIC_URL}/markdown/AboutLD.MD`,
            `${process.env.PUBLIC_URL}/markdown/AboutLOD.MD`,
            `${process.env.PUBLIC_URL}/markdown/myFirstLD.MD`,
            `${process.env.PUBLIC_URL}/markdown/BrowseLD.MD`,
            `${process.env.PUBLIC_URL}/markdown/QueryLD.MD`,
            `${process.env.PUBLIC_URL}/markdown/EnrichLD.MD`,
          ],
        },
        2: {
          expanded: false,
          markdownURIs:
          [
            `${process.env.PUBLIC_URL}/markdown/AboutBPIL.MD`,
            `${process.env.PUBLIC_URL}/markdown/BPIL1.MD`,
            `${process.env.PUBLIC_URL}/markdown/BPIL2.MD`,
            `${process.env.PUBLIC_URL}/markdown/BPIL3.MD`,
          ],
        },
      },
    };
  }

  handleClose() {
    this.setState({ dialogOpen: false });
  }

  openRemoteMarkdown(id, markdownId) {
    fetch(this.state.tutorials[id].markdownURIs[markdownId]).then(
        result => result.text()).then(
        body => this.setState({
          markdownText: body,
          dialogOpen: true,
        }),
    );
  }
  expandCollapseCard(id) {
    const tutorals = this.state.tutorials;
    tutorals[id].expanded = !this.state.tutorials[id].expanded;
    this.setState({ tutorials: tutorals });
  }

  render() {
    const cardActions = [
      <FlatButton
        label="Close"
        primary
        onClick={this.handleClose.bind(this)}
      />,
    ];
    return (
      <div className="TutorialWrapper">
        <Card
          className="TutorialCard"
          expanded={this.state.tutorials[1].expanded}
          onClick={() => this.expandCollapseCard(1)}
        >
          <CardMedia>
            <img src={`${process.env.PUBLIC_URL}/images/tut1.png`} alt="Getting Started" />
          </CardMedia>
          <CardTitle title="Getting Started" subtitle="Learn Linked Data" />
          <CardText className="TutorialCardText" expandable>
            <strong>Linked Data</strong> is a method of publishing structured data so that it
              can be linked and queried.
              With this tutorial you will learn the basics of the Linked Data
              technology and will generate your first Linked Data.
            </CardText>
          <CardActions expandable>
            <FlatButton
              label="About the tool"
              onClick={() => this.openRemoteMarkdown(1, 0)}
            />
            <FlatButton
              label="About Linked Data"
              onClick={() => this.openRemoteMarkdown(1, 1)}
            />
            <FlatButton
              label="About Linked Open Data Cloud"
              onClick={() => this.openRemoteMarkdown(1, 2)}
            />
            <FlatButton
              backgroundColor={green500}
              label="Tutorial: My first Linked Data"
              onClick={() => this.openRemoteMarkdown(1, 3)}
            />
            <FlatButton
              backgroundColor={green500}
              label="Tutorial: Browse Linked Data"
              onClick={() => this.openRemoteMarkdown(1, 4)}
            />
            <FlatButton
              backgroundColor={green500}
              label="Tutorial: Query Linked Data"
              onClick={() => this.openRemoteMarkdown(1, 5)}
            />
            <FlatButton
              backgroundColor={green500}
              label="Tutorial: Enrich Linked Data"
              onClick={() => this.openRemoteMarkdown(1, 6)}
            />
          </CardActions>
        </Card>
        <Card
          className="TutorialCard"
          expanded={this.state.tutorials[2].expanded}
          onClick={() => this.expandCollapseCard(2)}
        >
          <CardMedia
            style={{ width: '100%', marginLeft: 'auto', marginRight: 'auto' }}
          >
            <img src={`${process.env.PUBLIC_URL}/images/bpil.png`} alt="Business Process Integration Lab" />
          </CardMedia>
          <CardTitle
            title="Business Process Integration Lab"
            subtitle="Linked Data for Supply-chain integration"
            actAsExpander
          />
          <CardText className="TutorialCardText" expandable>
            <strong> BPIL </strong> is a course at University of Twente where students
              learn how to build and integrate systems between different parties in a supply chain.
              Linked Data is a technology that helps to simplify
              data management and exchange between parties.
            </CardText>
          <CardActions expandable>
            <FlatButton
              label="About BPIL"
              onClick={() => this.openRemoteMarkdown(2, 0)}
            />
            <FlatButton
              label="Assignment 1: Explain Yourself"
              onClick={() => this.openRemoteMarkdown(2, 1)}
            />
            <FlatButton label="Assignment 2: Enrich It" onClick={() => this.openRemoteMarkdown(2, 2)} />
            <FlatButton label="Assignment 3: Use it" onClick={() => this.openRemoteMarkdown(2, 3)} />

          </CardActions>
        </Card>
        <Dialog
          open={this.state.dialogOpen}
          autoScrollBodyContent
          onRequestClose={this.handleClose.bind(this)}
          modal={false}
          actions={cardActions}
        >
          <Markdown source={this.state.markdownText} />
        </Dialog>


      </div>
    );
  }

}

export default Tutorialised;
