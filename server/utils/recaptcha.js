const axios = require("axios");

//recaptcha function , return the success, score , action 
//please provide it with the token , res
async function recaptchaServerCheck(recaptchaToken) {
    try{
        console.log("trying to verify captcha token");
        const recaptchaSecretKey = process.env.RECAPTCHA_SECRET;
        const recaptchaResponse = await axios.post(
            `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecretKey}&response=${recaptchaToken}`
        );
        //get the values from the google response data and legit check it 
        const { success, score , action } = recaptchaResponse.data;
        console.log("Received things from google api for captcha");
        //return as object
        return { success, score , action }
    }catch(err){
        console.log("recaptcha login failed 1")
        throw new Error("reCAPTCHA verification failed");
    }
}

module.exports = {
	recaptchaServerCheck,
};
