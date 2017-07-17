/**
 * Created by Gerwin Bosch on 27-6-2017.
 */
import React, {Component} from 'react';
import logo from './logo.svg';
import './DataImport.css';
import FlatButton from 'material-ui/FlatButton/'
import RaisedButton from 'material-ui/RaisedButton/'
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table'
import Paper from 'material-ui/Paper'
import TextField from 'material-ui/TextField'

const styles = {
    button: {
        margin: 12,
    },
    exampleImageInput: {
        cursor: 'pointer',
        position: 'absolute',
        top: 0,
        bottom: 0,
        right: 0,
        left: 0,
        width: '100%',
        opacity: 0,
    },
};


function csvToText(text, delimitter, stdDelimitter) {
    var lines = text.split(stdDelimitter);
    for (let i = 0; i < lines.length; i++) {
        if (!lines[i] || lines[i] === "") continue;
        lines[i] = lines[i].split(delimitter);

    }
    //Remove empty lines
    lines = lines.filter(function (line) {
        for (let i = 0; i < line.length; i++) {
            if (line[i]) {
                return true;
            }
        }
        return false;
    });
    return lines;
}
class TableView extends Component {
    render() {
        // If there is data render the view
        console.log(this.props.data)
        if (this.props.data) {
            return (
                <Table
                    className='myTable'
                    bodyStyle={{tableLayout:'auto',overflowY:'visible', overflowX:'visible'}}
                    headerStyle={{OverflowX:'visible',width:'100%',tableLayout:'auto'}}
                    wrapperStyle={{width:'100%',overflowX:'auto',display:'inline-block', tableLayout:'auto', maxHeight:'756px'}}
                >
                    {/*Render the table header*/}
                    <TableHeader adjustForCheckbox={false} displaySelectAll={false}>
                        <TableRow style={{}}>
                            {/*Create columns for every data*/}
                            {this.props.data[0].map((x) => (
                                <TableHeaderColumn key={x} style={{width:'75px',maxWidth:'75px'}}>{x}</TableHeaderColumn>
                            ))}
                        </TableRow>

                    </TableHeader>
                    <TableBody displayRowCheckbox={false}>
                        {/*Grab the rest of the data*/}
                        {this.props.data.slice(1, this.props.data.length).map((row) => (
                            //Split the data in rows and columns
                            <TableRow style={{}}>{
                                row.map((x) => (
                                    <TableRowColumn style={{width:'75px',maxWidth:'75px'}}>{x}</TableRowColumn>
                                ))}</TableRow>
                        ))}
                    </TableBody>
                </Table>
            )
            //    Return empty div
        } else {
            return (<p>No Data Loaded</p>)
        }
    }
}

class ImportView extends Component {
    constructor() {
        super();
        this.state = {
            import_file: '',
            data: '',
            selectedFile: 'No File selected'
        };

        this.handleFileChange = this.handleFileChange.bind(this);
    }


    handleFileChange(event) {
        const reader = new FileReader();
        console.log(event.target.files);
        if (event.target.files.length === 0) {
            this.setState({
                selectedFile: "No file selected",
                data: ''
            });
            return
        }
        if (event.target.files[0].name.split('\.').pop() !== 'csv') {
            this.setState({
                selectedFile: "Wrong filetype selected",
                data: ''
            });
            return;
        }
        reader.addEventListener('load', () => {
            this.setState({
                data: csvToText(reader.result, /[,|;\t]/g, '\r\n'),
            })
        });
        if (event.target.files) {
            reader.readAsText(event.target.files[0], 'UTF-8');
            this.setState({
                selectedFile: event.target.files[0].name
            })
        }
    }

    renderTable() {
        return <TableView data={this.state.data}/>
    }


    render() {
        let toContinue = this.state.data === '';
        return (
            <div className="dataImport">
                <Paper zDepth={1}>
                    <FlatButton
                        label="Choose an File"
                        labelPosition="before"
                        style={styles.button}
                        containerElement="label"
                    >
                        <TextField disabled={true} hintText={this.state.selectedFile}/>
                        <input accept="csv" type="file" onChange={this.handleFileChange}
                               style={styles.exampleImageInput}/>
                    </FlatButton>
                    <FlatButton
                        label="continue"
                        disabled={toContinue}
                        style={{
                            float: 'right',
                            margin: 14
                        }}
                        onClick={() => this.props.pageFunction(2,this.state.data)}
                    />
                </Paper>
                <Paper zDepth={1} style={{width:'100%'}}>
                    {this.renderTable()}
                </Paper>

            </div>
        )
    }
}
export default ImportView;