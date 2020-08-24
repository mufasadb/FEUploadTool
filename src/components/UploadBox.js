import React, { Component } from 'react';
import axios from 'axios';
import { Progress } from 'reactstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

class UploadBox extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedFile: null,
            loaded: 0,
            responses: []
        }

    }
    checkMimeType = (event) => {
        //getting file object
        let files = event.target.files
        //define message container
        let err = []
        // list allow mime type
        const types = ['image/png', 'image/jpeg', 'image/gif']
        // loop access array
        for (var x = 0; x < files.length; x++) {
            // compare file type find doesn't matach
            if (types.every(type => files[x].type !== type)) {
                // create error message and assign to container   
                err[x] = files[x].type + ' is not a supported format\n';
            }
        };
        for (var z = 0; z < err.length; z++) {// if message not same old that mean has error 
            // discard selected file
            toast.error(err[z])
            event.target.value = null
        }
        return true;
    }
    maxSelectFile = (event) => {
        let files = event.target.files
        if (files.length > 3) {
            const msg = 'Only 3 images can be uploaded at a time'
            event.target.value = null
            toast.warn(msg)
            return false;
        }
        return true;
    }
    checkFileSize = (event) => {
        let files = event.target.files
        let size = 2000000
        let err = [];
        for (var x = 0; x < files.length; x++) {
            if (files[x].size > size) {
                err[x] = files[x].type + 'is too large, please pick a smaller file\n';
            }
        };
        for (var z = 0; z < err.length; z++) {// if message not same old that mean has error 
            // discard selected file
            toast.error(err[z])
            event.target.value = null
        }
        return true;
    }
    onChangeHandler = event => {
        var files = event.target.files;
        let newFiles = [];
        this.setState({
            selectedFile: files,
            loaded: 0
        })
    }

    onClickHandler = () => {
        if (this.state.selectedFile.length > 0) {
            const data = new FormData()
            for (var x = 0; x < this.state.selectedFile.length; x++) {
                data.append('file', this.state.selectedFile[x])
            }
            axios.post("http://localhost:8000/upload", data, {
                onUploadProgress: ProgressEvent => {
                    this.setState({
                        loaded: (ProgressEvent.loaded / ProgressEvent.total * 100),
                    })
                },
            })
                .then(res => { // then print response status
                    let addresses = [];
                    for (let item of res.data.Data) {
                        console.log(item)
                        addresses.push(item)
                    };
                    console.log(`adding ${this.state.responses.length} new responses`)
                    this.setState({
                        responses: addresses,
                        selectedFile: null
                    })
                    toast.success('upload success')

                })
                .catch(err => { // then print response status
                    toast.error('upload fail')
                })
        }
    }
    render() {
        let renderContent = '';
        let listContent = '';
        if (this.state.responses.length > 0) {
            renderContent = <h3>Upload was successful, here are your publicaly hosted files </h3>
            listContent = this.state.responses.map((item, index) => {
                return (<a href={item.Location}> <li key={index}>{item.key}</li></a>)
            })
        } 
        return (
            <div class="container">
                <div class="row">
                    <div class="offset-md-3 col-md-6">
                        <div class="form-group files">
                            <label>Upload Your File </label>
                            <input type="file" className="form-control" multiple onChange={this.onChangeHandler} />
                        </div>
                        <div class="form-group">
                            <ToastContainer />
                            <Progress max="100" color="success" value={this.state.loaded} >{Math.round(this.state.loaded, 2)}%</Progress>

                        </div>
                        <div>
                            {renderContent}
                            {listContent}
                        </div>

                        <button type="button" className="btn btn-success btn-block" onClick={this.onClickHandler}>Upload</button>

                    </div>
                </div>
            </div>
        );
    }
}

export default UploadBox;