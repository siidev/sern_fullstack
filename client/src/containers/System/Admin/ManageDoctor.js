import React, { Component } from "react";
import { connect } from "react-redux";
import "./ManageDoctor.scss";
import * as actions from "../../../store/actions";

import MarkdownIt from "markdown-it";
import MdEditor from "react-markdown-editor-lite";
import "react-markdown-editor-lite/lib/index.css";
import Select from "react-select";
import { CRUD_ACTION, LANGUAGES } from "../../../utils";
import { getDetailInforDoctor } from "../../../services/userService";

// const options = [
//   { value: 'chocolate', label: 'Chocolate' },
//   { value: 'strawberry', label: 'Strawberry' },
//   { value: 'vanilla', label: 'Vanilla' }
// ]
const mdParser = new MarkdownIt(/* Markdown-it options */);

class ManageDoctor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      contentMarkdown: '',
      contentHTML: '',
      description: '',
      listDoctors: [],
      hasOldData: false,
      selectedOption: '',


      listPrice: [],
      listPayment: [],
      listProvince: [],
      selectedPrice: '',
      selectedPayment: '',
      selectedProvince: '',
      nameClinic: '',
      addressClinic: '',
      note: '',
    };
  }

  componentDidMount() {
    this.props.fetchAllDoctors();
    this.props.getAllRequiredDoctorInfor();
  }

  buildDataSelect = (inputData, type) => {
    let result = [];
    let {language} = this.props;
    if(inputData && inputData.length > 0){
      if(type === 'USERS'){
        inputData.map((item, index) =>{
          let object = {}
          let labelVi= `${item.lastName} ${item.firstName}`;
          let labelEn= `${item.firstName} ${item.lastName}`;
          object.label = language === LANGUAGES.VI ? labelVi : labelEn;
          object.value = item.id;
          result.push(object);
        })
      }

      if(type === 'PRICE'){
        inputData.map((item, index) => {
          let object = {};
          let labelVi = `${item.valueVi} VND`;
          let labelEn = `${item.valueEn} USD`;
          object.label = language === LANGUAGES.VI ? labelVi : labelEn;
          object.value = item.keyMap;
          result.push(object);
        })
      }
      if(type === 'PAYMENT' || type === 'PROVINCE'){
        inputData.map((item, index) => {
          let object = {};
          let labelVi = `${item.valueVi}`;
          let labelEn = `${item.valueEn}`;
          object.label = language === LANGUAGES.VI ? labelVi : labelEn;
          object.value = item.keyMap;
          result.push(object);
        })
      }
    }
    return result;
  }

  componentDidUpdate(prevProps, prevState) {
    if(prevProps.allDoctors !== this.props.allDoctors){
      let dataSelect = this.buildDataSelect(this.props.allDoctors,'USERS');
      this.setState({
        listDoctors: dataSelect,

      })
    }
    
    if(prevProps.allRequiredDoctorInfor !== this.props.allRequiredDoctorInfor){
      let{resPrice, resPayment, resProvince}= this.props.allRequiredDoctorInfor;

      let dataSelectPrice=this.buildDataSelect(resPrice,'PRICE');
      let dataSelectPayment=this.buildDataSelect(resPayment, 'PAYMENT');
      let dataSelectProvince=this.buildDataSelect(resProvince, 'PROVINCE');

      this.setState({
          listPrice: dataSelectPrice,
          listPayment: dataSelectPayment,
          listProvince: dataSelectProvince,
      })
    }

    if(prevProps.language !== this.props.language) {
      let{resPrice, resPayment, resProvince}= this.props.allRequiredDoctorInfor;
      let dataSelect = this.buildDataSelect(this.props.allDoctors, 'USERS');
      let dataSelectPrice = this.buildDataSelect(resPrice, 'PRICE');
      let dataSelectPayment = this.buildDataSelect(resPayment, 'PAYMENT');
      let dataSelectProvince = this.buildDataSelect(resProvince, 'PROVINCE');
      this.setState({
        listDoctors: dataSelect,
        listPrice: dataSelectPrice,
        listPayment: dataSelectPayment,
        listProvince: dataSelectProvince
      })
    }
  }
  handleEditorChange = ({ html, text }) => {
    this.setState({
      contentMarkdown: text,
      contentHTML: html,
    })
    console.log("handleEditorChange", html, text);
  }

  handleSaveMarkdown = () => {
    let {hasOldData} = this.state;
    this.props.saveDetailDoctor({
      contentHTML: this.state.contentHTML,
      contentMarkdown: this.state.contentMarkdown,
      description: this.state.description,
      doctorId: this.state.selectedOption.value,

      selectedPrice: this.state.selectedPrice.value,
      selectedPayment: this.state.selectedPayment.value,
      selectedProvince: this.state.selectedProvince.value,
      nameClinic: this.state.nameClinic,
      addressClinic: this.state.addressClinic,
      note: this.state.note,


      action: hasOldData === true ? CRUD_ACTION.EDIT : CRUD_ACTION.CREATE
    })
  };

  handleOnChangeDes = (e) => {
    this.setState({
      description: e.target.value,
    })
  }

  handleChangeSelect = async (selectedOption) => {
    this.setState({ selectedOption });
    let res = await getDetailInforDoctor(selectedOption.value)
    if( res && res.errCode === 0 && res.data && res.data.Markdown){
      let markdown = res.data.Markdown;
      this.setState({
        contentHTML: markdown.contentHTML,
        contentMarkdown: markdown.contentMarkdown,
        description: markdown.description,
        doctorId: markdown.value,
        hasOldData: true
      })
    }else{
      this.setState({
        contentHTML: '',
        contentMarkdown: '',
        description: '',
        doctorId: '',
        hasOldData: false
      })
    }
    console.log(`Option selected:`, res);
  };

  handleChangeSelectDoctorInfor = (selectedOption, name) => {
    let stateName = name.name;
    let stateCopy = {...this.state};
    stateCopy[stateName] = selectedOption;

    this.setState({
      ...stateCopy
    })
  }

  handleOnChangeText = (e, id) => {
    let stateCopy = {...this.state};
    stateCopy[id] = e.target.value;
    this.setState({
      ...stateCopy
    })
  }

  render() {
    //truyen props xuong ko can arrow func
    console.log('chck doctor: ', this.state)
    console.log('fisdsadrst ', this.state.selectedPrice)
    let {hasOldData} = this.state;
    return (
      <div className="manage-doctor-container">
        <div className="manage-doctor-title">
          Create more doctor information
        </div>
        <div className="more-infor">
          <div className="content-left form-group">
          <label>Chọn bác sĩ</label>
            <Select
              value={this.state.selectedOption}
              onChange={this.handleChangeSelect}
              options={this.state.listDoctors}
              placeholder={'Chọn bác sĩ'}
              name={'selectedOption'}
            />
          </div>
          <div className="content-right">
          <label> Thông tin giới thiệu</label>
            <textarea className="form-control" rows="4" 
            onChange={(e) => this.handleOnChangeDes(e)}
            value={this.state.description}>
            </textarea>
          </div>
        </div>
        <div className="more-infor-extra row">
          <div className="col-4 form-group">
            <label>Giá khám bệnh</label>
            <Select
              value={this.state.selectedPrice}
              onChange={this.handleChangeSelectDoctorInfor}
              options={this.state.listPrice}
              placeholder={'Chọn giá'}
              name={'selectedPrice'}/>
          </div>
          <div className="col-4 form-group">
            <label>Chọn phương thức thanh toán</label>
            <Select
              value={this.state.selectedPayment}
              onChange={this.handleChangeSelectDoctorInfor}
              options={this.state.listPayment}
              placeholder={'Chọn phương thức thanh toán'}
              name={'selectedPayment'}/>
          </div>
          <div className="col-4 form-group">
            <label>Chọn tỉnh thành</label>
            <Select
              value={this.state.selectedProvince}
              onChange={this.handleChangeSelectDoctorInfor}
            options={this.state.listProvince}
            placeholder={'Chọn tỉnh thành'}
            name={'selectedProvince'}/>
          </div>
          <div className="col-4 form-group">
            <label>Tên phòng khám</label>
            <input type="text" className="form-control" onChange={ (e) => this.handleOnChangeText(e, 'nameClinic')}
              value={this.state.nameClinic}/>
          </div>
          <div className="col-4 form-group">
            <label>Địa chỉ phòng khám</label>
            <input type="text" className="form-control" onChange={ (e) => this.handleOnChangeText(e, 'addressClinic')}
              value={this.state.addressClinic}/>
          </div>
          <div className="col-4 form-group">
            <label>Ghi chú</label>
            <input type="text" className="form-control" onChange={ (e) => this.handleOnChangeText(e, 'note')}
              value={this.state.note}/>
          </div>
        </div>
        <div className="manage-doctor-editor">
          <MdEditor
            style={{ height: "400px" }}
            renderHTML={(text) => mdParser.render(text)}
            onChange={this.handleEditorChange}
            value={this.state.contentMarkdown}
          />
        </div>
        <button
          className={hasOldData === true ? "save-content-doctor" : "create-content-doctor"}
          onClick={() => this.handleSaveMarkdown()}>
          {hasOldData === true ? "Save information" : "Edit information"}
        </button>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    language: state.app.language,
    allDoctors: state.admin.allDoctors,
    allRequiredDoctorInfor: state.admin.allRequiredDoctorInfor,

  };
};
 
const mapDispatchToProps = (dispatch) => {
  return {
    fetchAllDoctors : () =>dispatch(actions.fetchAllDoctors()),
    saveDetailDoctor: (data) => dispatch(actions.saveDetailDoctor(data)),
    getAllRequiredDoctorInfor: ()=> dispatch(actions.getRequiredDoctorInfor()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ManageDoctor);
