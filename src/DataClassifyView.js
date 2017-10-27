/**
 * Created by Gerwin Bosch on 3-7-2017.
 */
import React, { Component } from 'react';
import Paper from 'material-ui/Paper';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';
import CheckBox from 'material-ui/Checkbox';
import Dialog from 'material-ui/Dialog';
import 'whatwg-fetch';
import IconButton from 'material-ui/IconButton';
import ActionSearch from 'material-ui/svg-icons/action/search';
import { Step, Stepper, StepLabel } from 'material-ui/Stepper';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import ArrowBack from 'material-ui/svg-icons/navigation/arrow-back';
import PropTypes from 'prop-types';
import { SelectField } from 'material-ui';
import literalMap from './literalMapping';

class DataClassifyView extends Component {
  constructor(props) {
    super(props);
    this.state = (
      {
        dialog: {
          open: false,
          id: 0,
          searchText: '',
          results: [],
          stepIndex: 0,
          vocabPickerIndex: 0,
          error: '',
          lovAvailable: true,
          vocabDownText: '',
        },
        uriDialog: {
          open: false,
          error: '',
          text: '',
        },
        tagDialog: {
          open: false,
          error: '',
          text: '',
        },
      }
    );
  }

  /* Renders the source link */

  onBaseUriChange = (index, text) => {
    this.props.setBaseUri(index, text);
  };

  onVocabPicked = (_, index) => {
    const dialog = this.state.dialog;
    dialog.vocabPickerIndex = index;
    this.setState({
      dialog,
    });
  };

  onChange = (_, string) => {
    const dialog = this.state.dialog;
    dialog.searchText = string;
    this.setState({ dialog });
  };
  onUriChange = (_, string) => {
    const dialog = this.state.dialog;
    dialog.vocabDownText = string;
    this.setState({ dialog });
  };
  onTagChange = (_, string) => {
    const tagDialog = this.state.tagDialog;
    tagDialog.text = string;
    this.setState({ tagDialog });
  };
  onDialogUriChange = (_, string) => {
    const uriDialog = this.state.uriDialog;
    uriDialog.text = string;
    this.setState({ uriDialog });
  };

  getAmountOfClasses = () => {
    const classes = this.props.data.slice();
    if (classes.length === 0) return 0;
    let counter = 0;
    for (let i = 0; i < classes.length; i += 1) {
      const item = classes[i];
      if (item.uri) {
        counter += 1;
      }
    }
    return counter;
  };

  // Opens the dialog and set the row number of the item that was picked
  handleOpen = (i) => {
    const dialog = this.state.dialog;
    dialog.open = true;
    dialog.id = i;
    this.setState({
      dialog,
    });
  };

  handleClose = () => {
    const dialog = this.state.dialog;
    dialog.open = false;
    dialog.id = -1;
    dialog.stepIndex = 0;
    dialog.results = [];
    dialog.vocabPickerIndex = 0;
    this.setState({
      dialog,
    });
  };

  handleNext = () => {
    const dialog = this.state.dialog;
    dialog.stepIndex = 1;
    this.setState({
      dialog,
    });
  };

  searchVocabulary = (e) => {
    const query = this.state.dialog.searchText;
    const dialog = this.state.dialog;
    e.preventDefault();
    fetch(
      `http://lov.okfn.org/dataset/lov/api/v2/term/search?q=${query}&type=class`)
      .then((response) => {
        if (!response.ok) {
          throw Error(response);
        }
        return response.json();
      })
      .then((json) => {
        dialog.results = json.results.map(
          item => ({
            uri: item.uri[0],
            vocabPrefix: item['vocabulary.prefix'][0],
            prefix: item.prefixedName[0],
          }),
        );
        if (dialog.results.length === 0) {
          dialog.error = 'No results found';
        }
        dialog.lovAvailable = true;
        this.setState({ dialog });
      })
      .catch((ex) => {
        if (ex.statusText) {
          dialog.error = `Request failed due to ${ex}`;
        } else {
          dialog.error = 'LOV is currently not available';
          dialog.lovAvailable = false;
        }
        console.error('parsing failed', ex);
        this.setState(dialog);
      });
  };
  handlePick = () => {
    const dialog = this.state.dialog;
    let result;
    if (this.state.dialog.lovAvailable) {
      result = dialog.results[dialog.vocabPickerIndex];
      result.name = result.prefix.split(':')[1];
    } else {
      let name = this.props.data[this.state.dialog.id].columnName;
      name = name.toLowerCase();
      name = name.replace(/ /g, '_');
      let uri = this.state.dialog.vocabDownText;
      uri = uri.toLowerCase();
      uri = uri.replace(/ /g, '_');
      result = {
        uri,
        name,
      };
    }
    this.props.setClass(this.state.dialog.id, result);
    this.props.setUri(this.state.dialog.id, true);
    dialog.open = false;
    dialog.id = 0;
    dialog.searchText = '';
    dialog.stepIndex = 0;
    dialog.vocabPickerIndex = 0;
    dialog.results = [];
    this.setState({ dialog });
  };

  resetItem(index) {
    this.props.setClass(index, { name: 'Literal' });
    this.props.setUri(index, false);
    this.props.setBaseUri(index, null);
  }

  handleColumnChange = (index, value) => {
    switch (value) {
      case 'Language tagged String':
        this.setState({ tagDialog: { open: true, column: index } });
        break;
      case 'Other':
        this.setState({ uriDialog: { open: true, column: index } });
        break;
      default:
        this.props.setLiteralType(index, value);
    }
  };


  toNextPage() {
    this.props.nextPage(this.state.data);
  }

  continueDisabled() {
    return this.getAmountOfClasses() === 0;
  }

  startClassification(index) {
    this.handleOpen(index);
  }

  renderDialogTableBody() {
    if (!this.state.dialog.lovAvailable) {
      return (<TextField
        id="emergencyTextField"
        name="Class URI"
        hintText="The class of the URI"
        onChange={this.onUriChange}
      />);
    }
    if (this.state.dialog.results.length) {
      const result = this.state.dialog.results.map((column, index) =>
        (<MenuItem
          key={column.prefix}
          value={index}
          label={column.prefix}
          primaryText={column.prefix}
        />));
      return (
        <DropDownMenu
          value={this.state.dialog.vocabPickerIndex}
          onChange={this.onVocabPicked}
          openImmediately
        >
          {result}
        </DropDownMenu>
      );
    }
    return <div />;
  }

  renderDialogBody() {
    const item = this.props.data[this.state.dialog.id];
    if (!item) {
      return <div />;
    }
    switch (this.state.dialog.stepIndex) {
      case 0:
        return (
          <div>
            <p>In this dialog, you can specify a base URI for your data.
              This base URI will be used to form URIs for data instances.</p>
            <p>There are 2 possibilities:</p>
            <ol type="1">
              <li>If you know that a column contains only unique values then you can just
                  submit a base URI. The values from the column will be added at the
                end of the base URIs forming proper URIs for data instances.</li>
              <li>If a column already conatains proper URIs then leave this field empty.</li>
            </ol>
            <p>Column name: {item.columnName}</p>
            <p>Example value: {item.exampleValue}</p>
            <TextField
              name="Base-uri:"
              type="url"
              hintText="type a base URI here"
              onChange={(event, string) => this.onBaseUriChange(
                this.state.dialog.id, string)}
            />
          </div>

        );
      case 1:
        return (
          <div>
            <p>This dialog allows specifying the class of things described by the data.
            For example, if your data features people then you can use
              <em> foaf:Person </em> </p>
            <p>Examples are: person, company, animal etc.</p>
            <form onSubmit={this.searchVocabulary}>
              <TextField
                name="Search vocabularies"
                hintText="class name"
                onChange={this.onChange}
                errorText={this.state.dialog.error}
              />
              <IconButton type="submit"><ActionSearch /></IconButton>
            </form>
            <p>Provide a class name in the field above and pick a term from the suggestions</p>
            <p> <em> Similar terms can be found in different vocabularies
                therefore try to use as few vocabularies as possible</em></p>
            {this.renderDialogTableBody()}

          </div>
        );
      default:
        return <div />;
    }
  }

  render() {
    const actions = [
      <FlatButton
        label={(this.state.dialog.stepIndex === 0) ? 'Next' : 'Finish'}
        primary
        onClick={(this.state.dialog.stepIndex === 0) ?
          this.handleNext : this.handlePick}
        disabled={(this.state.dialog.stepIndex === 0 || this.state.dialog.vocabDownText) ?
          false : !!(this.state.dialog.results.length === 0 || this.state.dialog.vocabDownText)}
      />,
      <FlatButton
        label="Cancel"
        primary={false}
        onClick={this.handleClose}
      />,
    ];
    const tagActions = [
      <FlatButton
        label="Finish"
        primary
        onClick={() => {
          const tagDialog = this.state.tagDialog;
          if (!tagDialog.text) {
            tagDialog.error = 'empty';
            this.setState({ tagDialog });
          } else {
            this.props.setLiteralType(this.state.tagDialog.column, { label: 'Language tagged String', value: this.state.tagDialog.text });
          }
          tagDialog.open = false;
          tagDialog.text = '';
          tagDialog.column = -1;
          this.setState(tagDialog);
        }}

      />,
    ];
    const uriActions = [
      <FlatButton
        label="Finish"
        primary
        onClick={() => {
          const uriDialog = this.state.uriDialog;
          if (!uriDialog.text) {
            uriDialog.error = 'empty';
            this.setState({ uriDialog });
          } else {
            this.props.setLiteralType(this.state.uriDialog.column, { label: 'Other', value: this.state.uriDialog.text });
          }
          uriDialog.open = false;
          uriDialog.text = '';
          uriDialog.column = -1;
          this.setState(uriDialog);
        }}
      />,
    ];
    return (
      <div>
        <Paper zDepth={2}>
          <div style={{ width: '100%', display: 'inline-block' }}>
            <FlatButton
              label="continue"
              disabled={this.continueDisabled()}
              onClick={() => this.toNextPage()}
              style={{
                float: 'right',
                margin: 14,
              }}
            />
          </div>

        </Paper>
        <Paper zDepth={1}>
          <Table selectable={false}>
            <TableHeader adjustForCheckbox={false} displaySelectAll={false}>
              <TableRow>
                <TableHeaderColumn
                  tooltip="the column name"
                >Column Name</TableHeaderColumn>
                <TableHeaderColumn tooltip="The first value">Example Data
                    Value</TableHeaderColumn>
                <TableHeaderColumn tooltip="Is this a URI">Is it a URI?</TableHeaderColumn>
                <TableHeaderColumn tooltip="The type">Class of objects</TableHeaderColumn>
                <TableHeaderColumn tooltip="Base URI">Base
                    URI</TableHeaderColumn>
                <TableHeaderColumn tooltip="Reset">Reset</TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody displayRowCheckbox={false}>
              {
                this.props.data.map((column, index) =>
                  (<TableRow key={column.columnName}>
                    <TableRowColumn>{column.columnName}</TableRowColumn>
                    <TableRowColumn>{column.exampleValue}</TableRowColumn>
                    <TableRowColumn>
                      <CheckBox
                        checked={column.uri}
                        onCheck={() => this.startClassification(
                          index)}
                        disabled={column.uri}
                      />
                    </TableRowColumn>
                    <TableRowColumn>
                      {column.uri ? `URI : ${column.class.name}` :
                        (<SelectField
                          floatingLabelText="select types"
                          value={column.valueType}
                          onChange={(event, idx, value) => this.handleColumnChange(index, value)}
                        >
                          {literalMap.map(litDescr =>
                            (<MenuItem
                              key={litDescr.label}
                              label={litDescr.variableToAdd.length > 0 ? `${litDescr.variableToAdd[0]}:${column[litDescr.variableToAdd[0]]}` : litDescr.label}
                              value={litDescr.label}
                            >
                              {litDescr.label}
                            </MenuItem>),
                          )}
                        </SelectField>)

                      }
                    </TableRowColumn>
                    <TableRowColumn>
                      {column.baseUri ? column.baseUri : ''}
                    </TableRowColumn>
                    <TableRowColumn>
                      {
                        column.uri ?
                          (
                            <IconButton
                              onClick={() => this.resetItem(index)}
                            >
                              <ArrowBack />
                            </IconButton>
                          ) : <div />
                      }
                    </TableRowColumn>

                  </TableRow>),
                )
              }
            </TableBody>

          </Table>
        </Paper>
        <Dialog
          actions={actions}
          modal
          open={this.state.dialog.open}
        >
          <Stepper activeStep={this.state.dialog.stepIndex}>
            <Step>
              <StepLabel>Pick URI</StepLabel>
            </Step>
            <Step>
              <StepLabel>Select class</StepLabel>
            </Step>
          </Stepper>
          {this.renderDialogBody()}
        </Dialog>
        <Dialog
          actions={tagActions}
          open={this.state.tagDialog.open}
          modal
        >
          Please enter a language tag according to the ISO 639 Standard ex. (en or nl)
          <TextField
            id="tagText"
            errorText={this.state.tagDialog.error}
            onChange={this.onTagChange}
          />

        </Dialog>
        <Dialog
          actions={uriActions}
          open={this.state.uriDialog.open}
          modal
        >
          Please enter a URI
          <TextField
            id="uriText"
            errorText={this.state.uriDialog.error}
            onChange={this.onDialogUriChange}
          />

        </Dialog>

      </div>
    );
  }
}

DataClassifyView.propTypes = {
  setBaseUri: PropTypes.func.isRequired,
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  setClass: PropTypes.func.isRequired,
  setUri: PropTypes.func.isRequired,
  nextPage: PropTypes.func.isRequired,
  setLiteralType: PropTypes.func.isRequired,


};
export default DataClassifyView;
