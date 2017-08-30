/* eslint-disable react/jsx-no-bind,react/jsx-filename-extension */
import React, { Component } from 'react';
import Proptypes from 'prop-types';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import IconButton from 'material-ui/IconButton';
import Delete from 'material-ui/svg-icons/action/delete';
import QueryLibrary from './querybuilder';

const rdfsType = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';
const dcCreated = 'http://purl.org/dc/terms/created';
const dcDescription = 'http://purl.org/dc/terms/description';
const dcTitle = 'http://purl.org/dc/terms/title';

class DataBrowser extends Component {
  constructor(props) {
    super(props);
    this.state = {
      graphContexts: {},
      currentSelected: 0,
    };
    props.executeQuery(QueryLibrary.getDefaultGraph(), (err, results) => {
      if (err) {
        // TODO: implement error state
      } else {
        const currentstore = {};
        if (results.length !== 0) {
          results.forEach((result) => {
            if (!currentstore[result.subject.value]) {
              currentstore[result.subject.value] = {};
            }
            currentstore[result.subject.value][result.predicate.value] = result.object.value;
          });
        }
        this.setState({ graphContexts: currentstore });
      }
    });
  }
  changeCurrentGraph(row, selectedIndex) {
    console.log(row);
    console.log(selectedIndex);
    switch (selectedIndex) {
      case -1:
        this.setState({ currentSelected: row });
        break;
      default:
    }
  }

  renderGraphTable() {
    return (
      <Table selectable onCellClick={this.changeCurrentGraph.bind(this)}>
        <TableHeader displaySelectAll={false}>
          <TableRow>
            <TableHeaderColumn tooltip="the Title">Title</TableHeaderColumn>
            <TableHeaderColumn tooltip="The description" >Description</TableHeaderColumn>
            <TableHeaderColumn tooltip="The URI">URI</TableHeaderColumn>
            <TableHeaderColumn tooltip="The data of creation">Date</TableHeaderColumn>
            <TableHeaderColumn tooltip="Remove the dataset">Delete</TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody
          onRowSelection={this.changeCurrentGraph.bind(this)}
          deselectOnClickaway={false}

        >
          {Object.keys(this.state.graphContexts).map((key, count) => {
            const graph = this.state.graphContexts[key];
            // Limited filtering
            if (graph[rdfsType] && graph[rdfsType] === 'http://rdfs.org/ns/void#Datset') {
              return (
                <TableRow selected={count === this.state.currentSelected}>
                  <TableRowColumn>{graph[dcTitle]}</TableRowColumn>
                  <TableRowColumn>{graph[dcDescription]}</TableRowColumn>
                  <TableRowColumn>{key}</TableRowColumn>
                  <TableRowColumn>{graph[dcCreated]}</TableRowColumn>
                  <TableRowColumn><IconButton><Delete /></IconButton></TableRowColumn>
                </TableRow>
              );
            }
            return '';
          })}
        </TableBody>
      </Table>
    );
  }
  render() {
    return (
      <div>
        {this.renderGraphTable()}
      </div>
    );
  }
}
DataBrowser.propTypes = {
  executeQuery: Proptypes.func.isRequired,
};
export default DataBrowser;
