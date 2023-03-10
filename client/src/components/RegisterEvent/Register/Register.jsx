import QR from "../../../images/qr-ticket.png"
import Dotted from "../../../images/dottedbox.png"
import { useNavigate } from "react-router-dom";
import './Register.css';
import { db } from "../../../firebase-config";
import { collection, doc, getDocs, getDoc, updateDoc, addDoc, setDoc } from "firebase/firestore";
import { useState, useEffect } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import {storage} from "../../../firebase-config"


export default function Register(props){
    const [isDisabled, setIsDisabled] = useState(false);
    const [user_registered, set_user_registered] = useState(false);
    const [upiID, setUpiID] = useState("");
    const [transactionID, setTransactionID] = useState("");
    const [imageUpload, setImageUpload] = useState(null);

    console.log("contact_", props.user_contact);

    const checkStatus = async () => {

        var userReference = doc(db, "users_list", props.user_id);
        var userData = await getDoc(userReference);
                console.log("printing")


        var paymentDetails = (userData).data().paymentDetails;
        
        if (paymentDetails[props.event_id] !== "Register"){
            var paymentReference = doc(db, "payments", paymentDetails[props.event_id]);
            var paymentData = await getDoc(paymentReference);
                console.log("printing")

            // console.log("paymentData: ", paymentData)
            if(paymentData.data() !== undefined)
            {
                var status = (paymentData).data().status;
                if (status === "processed"){
                    set_user_registered(true);
                }
                else{
                    document.getElementsByName("RegisterForEvent")[0].innerHTML = "Processing";
                    document.getElementById("ContactIfNotProcessed").style.visibility = "visible";
                    document.getElementsByName("RegisterForEvent")[0].classList.add("disabled");
                }
            }
            else{
                document.getElementsByName("RegisterForEvent")[0].innerHTML = "Register";
                document.getElementById("ContactIfNotProcessed").style.visibility = "hidden";
                document.getElementsByName("RegisterForEvent")[0].classList.remove("disabled");
            }
        }

    }

    
    useEffect(() => {
        if (props.loggedInStatus) {
            checkStatus();
        }
    },[props.loggedInStatus])

    const uploadFile = async (paymentId) => {
        console.log("uploading file")
        const storageRef = ref(storage, `${paymentId}`);
        const snapshot = await uploadBytes(storageRef, imageUpload);
                console.log("printing")

        console.log("uploaded file")
        // return the url of the uploaded file
        const downloadURL = await getDownloadURL(snapshot.ref);
                console.log("printing")

        return downloadURL;
    };

    const createPaymentObject = async () => {

        setIsDisabled(true)
        var status = "processing";
        
        if (props.iiitbStudent){
            status = "processed";
        }

        // event id
        const paymentRef = await addDoc(collection(db, "payments"), {
            event_id: props.event_id,
            multi: false,
            screenshot: "",
            status: status,
            transaction_id:transactionID,
            upi_id:upiID,
            user: props.user_id,
            name: props.user_name,
            contact: props.user_contact,
            email: props.email,
        });
                console.log("printing")

        
        let paymentObjectID = paymentRef.id;
        console.log("paymentObjectID: ", paymentObjectID);

        const upload_url = await uploadFile(paymentObjectID);
                console.log("printing")

        const paymentRef2 = doc(db, "payments", paymentObjectID);
        await updateDoc(paymentRef2, {
            screenshot: upload_url
        }).then(() => {
                console.log("printing")

        }).catch(err => {
                console.log("printing")

        })

        const userRef = doc(db, "users_list", props.user_id);
        const userDocSnap = await getDoc(userRef);
                console.log("printing")


        // if (userDocSnap.exists()){
        let paymentDetails = (userDocSnap).data().paymentDetails;
        paymentDetails[props.event_id] = paymentObjectID;

        await updateDoc(userRef, {
            paymentDetails: paymentDetails
        }).then(() => {
                console.log("printing")

        }).catch(err => {
                console.log("printing")

        })

        // document.getElementById("payBaseFeeButton").innerHTML = "Processing";
        document.getElementsByName("RegisterForEvent")[0].classList.add("disabled");
        
        if (props.iiitbStudent){
            document.getElementsByName("RegisterForEvent")[0].innerHTML = "Registered";
        }
        else{
            document.getElementsByName("RegisterForEvent")[0].innerHTML = "Processing";
            document.getElementById("ContactIfNotProcessed").style.visibility = "visible";
        }
        setIsDisabled(false)
    }



    return (
        <div>
            <div style={{"textAlign":"center"}}>
            <h1 style={{"color":"white","paddingTop":"32px", "paddingBottom":"10px","fontSize":"3rem","fontFamily":"Archivo","fontWeight":"700"}}>REGISTER</h1>
            </div>


            <div className="costDiv">
                Rs. {props.event_fee}
            </div>

            {(props.loggedInStatus)
            ? (<div style={{"fontFamily": 'Poppins',"fontStyle": "normal","color":"#888888","paddingTop":"15px","marginLeft":"2.7vw"}}>
                ??? Signed in as {props.email}
            </div>)
            : (<div style={{"fontFamily": 'Poppins',"fontStyle": "normal","color":"#888888","paddingTop":"15px","marginLeft":"2.7vw"}}>
                ??? Not Signed In.
            </div>)}
            
            
            <div style={{"color":"white", "fontFamily":"Poppins","paddingLeft":"15px", "paddingTop": "30px"}}>
                <div style={{"paddingBottom": "3px"}}>
                <span>Event Fee</span><span style={{"float":"right","paddingRight":"50px"}}>Rs. {props.event_fee}</span>
                </div>
                {/* <hr style={{"border":"2px solid", "backgroundColor":"#A23F5f"}}/> */}
                <div style={{"backgroundColor":"white","height":"2px","marginRight":"20px"}}>

              </div>
                <div style={{"paddingTop": "3px"}}>
                <span>Total Fee</span><span style={{"float":"right","paddingRight":"50px"}}>Rs. {props.event_fee}</span>
                </div>  
            </div>


            
            {
            user_registered
            ?
                <div style={{ "fontFamily": 'Poppins', "fontStyle": "normal", "color": "white", "paddingTop": "20px", "textAlign":"center" }}>
                    <h2>
                        You are registered
                    </h2>
                </div>
            :
            props.iiitbStudent === true
            ?
                <div style={{"textAlign":"center"}}>
                    <button
                        name="RegisterForEvent"
                        className="btn btn-default" 
                        style={{"backgroundColor":"white","marginTop":"25px"}}
                        disabled={isDisabled}
                        onClick={
                            createPaymentObject
                        }>Register
                    </button>   
                </div>
            :
            <div>
                <div style={{"color":"white","marginTop":"30px"}}>
                <h1 style={{"textAlign":"center","fontSize":"3rem","fontFamily":"Archivo","fontWeight":"700"}}>PAYMENT</h1>
                    <div style={{"marginLeft":"15px","marginRight":"15px", "marginTop": "15px", "marginBottom": "15px"}}>Pay the above mentioned amount using UPI and 
                    upload the receipt screenshot here, making sure that the UPI reference ID is visible. Our team will 
                    verify the payment. The 'Register' button will turn 
                    to 'Registered ' if it is approved :</div>
                </div>

                <div className="fluid-container">
                    <div className="row">
                        <div className="col-6" style={{"paddingLeft":"10px","paddingTop":"20px"}}>
                            <img src={QR} className="img-fluid" style={{"paddingRight":"15px","paddingLeft":"15px"}} alt="QR"/>
                        </div>
                            
                        <div className="col-6 clickk" onClick={()=>{
                            document.getElementById("inputFile").click()
                        }} style={{"paddingTop":"20px"}}>
                            <input type={"file"} id="inputFile" style={{"display":"none"}} accept="image/*" onChange={(e)=>{
                                //e.target.files[0] can be posted to backend
                                setImageUpload(e.target.files[0])
                                var file=e.target.files[0];
                                var imgtag=document.getElementById("dotted1");
                                var reader=new FileReader();
                                reader.onload=function(event){
                                    imgtag.src=event.target.result;
                                };
                                reader.readAsDataURL(file);
                            }}></input>
                            <img src={Dotted} className="img-fluid" id="dotted1" style={{"paddingRight":"15px","paddingLeft":"15px"}} alt="ScannedQR"/>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col12" style={{"textAlign":"center","color":"white","paddingTop":"20px"}}>
                        
                                <h5>UPI ID : iiitbangalore@icici</h5>
                            
                        </div>
                    </div>
                </div>
                
                
                <div style={{"paddingTop":"15px","textAlign":"center"}}>
                    <div>
                    <input 
                        placeholder="Enter UPI Reference Number / Transaction ID" 
                        id="inputID" 
                        
                        onChange={(event)=>{
                            setTransactionID(event.target.value);
                        }}
                    />
                    </div>
                    <div>
                    <input 
                        placeholder="Enter UPI ID" 
                        id="inputID" 
                        
                        onChange={(event)=>{
                            setUpiID(event.target.value);
                        }}
                    />
                    </div>
                
                    {(upiID !== "" && transactionID !== "" && imageUpload !== null) 
                    ?
                    <button
                        name="RegisterForEvent"
                        className="btn btn-default" 
                        style={{"backgroundColor":"white","marginTop":"25px"}}
                        disabled={isDisabled}
                        onClick={
                            createPaymentObject
                        }>Register
                        
                    </button>
                    :
                    <button
                        disabled
                        name="RegisterForEvent"
                        className="btn btn-default" 
                        style={{"backgroundColor":"white","marginTop":"25px"}}
                        onClick={
                            createPaymentObject
                        }>Register
                        
                    </button>
                    }
                    <div id="ContactIfNotProcessed" style={{"color":"white", "visibility":"hidden", "textAlign":"center", "marginTop": "30px"}}>
                    <p>Your payment will be processed within 24 hrs.</p> 
                    <p>If not done by then, contact +91 9043633668 on WhatsApp</p>
                    </div>
                </div>
            </div>
            }
            
            </div>
        // </div>
    );
}