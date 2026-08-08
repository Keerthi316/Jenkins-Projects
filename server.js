const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const xml2js = require("xml2js");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));


app.post("/register", (req, res) => {

    const {
        firstname,
        lastname,
        dob,
        email,
        gender,
        phone,
        password,
        confirmPassword
    } = req.body;


    const gmailPattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    const phonePattern = /^[6-9]\d{9}$/;


    if (!gmailPattern.test(email)) {
        return res.send("Invalid Gmail address");
    }


    if (!phonePattern.test(phone)) {
        return res.send("Invalid phone number");
    }


    if (password !== confirmPassword) {
        return res.send("Passwords do not match");
    }



    let participants = [];


    fs.readFile("registration.xml", "utf8", (err, data) => {


        if (!err && data.trim() !== "") {


            xml2js.parseString(data, (err, result) => {


                if (!err && 
                    result.eventRegistration &&
                    result.eventRegistration.participant) {

                    participants = result.eventRegistration.participant;

                }


                saveXML();

            });


        } 
        
        else {

            saveXML();

        }



    });



    function saveXML(){


        participants.push({

            firstName: firstname,

            lastName: lastname,

            dateOfBirth: dob,

            email: email,

            gender: gender,

            phone: phone,

            password: password

        });



        const object = {

            eventRegistration: {

                participant: participants

            }

        };



        const builder = new xml2js.Builder();

        const xml = builder.buildObject(object);



        fs.writeFile("registration.xml", xml, (err)=>{


            if(err){

                console.log(err);

                return res.send("XML save error");

            }


            res.send(`

<!DOCTYPE html>
<html>

<head>

<title>Registration Details</title>

<style>

body{
    font-family: Arial;
    background:#f2f2f2;
}

.container{

    width:400px;
    margin:40px auto;
    padding:20px;
    background:white;
    border-radius:10px;
    box-shadow:0 0 10px gray;

}

h2{

    text-align:center;
    color:green;

}

p{

    font-size:18px;

}

a{

    display:block;
    text-align:center;
    margin-top:20px;

}

</style>

</head>


<body>


<div class="container">


<h2>Registration Successful!</h2>


<p><b>First Name:</b> ${firstname}</p>

<p><b>Last Name:</b> ${lastname}</p>

<p><b>Date of Birth:</b> ${dob}</p>

<p><b>Email:</b> ${email}</p>

<p><b>Gender:</b> ${gender}</p>

<p><b>Phone:</b> ${phone}</p>


<a href="/">Register Another User</a>


</div>


</body>

</html>

`);



        });


    }


});



app.listen(8000, ()=>{

    console.log("Server running at http://localhost:8000");

});
