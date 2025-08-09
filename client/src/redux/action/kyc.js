import {
  ERROR,
  RESET_KYC,
  KYC_VERIFICATION,
  LOADING,
  ACCOUNT_MIGRATION,
  VERIFICATION_DETAILS_KYC,
  KYC_STATES,
  VERIFICATION_DETAILS,
  RESET_CONFIRM_KYC,
} from "./types";
import { error, success } from "../../components/Alert";
import { formatDate, generalErrMsg } from "../../helperFunctions";
import kycService from "../../services/kyc-service";
import { fetchAccounts, fetchProfile } from "./user";

export const kycVerification =
  (data, country, addressCountry, statecode) => async (dispatch) => {
    console.log(statecode);
    const state = country === "UNITED_STATES" ? statecode : data?.state.trim();
    let formDataSsn = new FormData();
    formDataSsn.append("firstName", data?.fname.trim());
    formDataSsn.append("lastName", data?.lname.trim());
    formDataSsn.append("phoneNumber", data?.phone.replace("+", ""));
    formDataSsn.append("streetAddress", data?.streetAddress.trim());
    formDataSsn.append("emailAddress", data?.email.trim());
    formDataSsn.append("city", data?.city.trim());
    formDataSsn.append("occupation", data?.occupation.trim());
    formDataSsn.append("postalCode", data?.postalCode.trim());
    formDataSsn.append("state", statecode ? statecode : data?.state);
    formDataSsn.append("addressCountry", addressCountry);
    formDataSsn.append("dateOfBirth", formatDate(data?.date));
    formDataSsn.append("dateOfBirthFormattedString", data?.date.trim());
    formDataSsn.append("driversLicence", data?.picture);
    formDataSsn.append("passport", data?.picture);

    let formDataPassport = new FormData();
    formDataPassport.append("firstName", data?.fname.trim());
    formDataPassport.append("lastName", data?.lname.trim());
    formDataPassport.append("phoneNumber", data?.phone.replace("+", ""));
    formDataPassport.append("streetAddress", data?.streetAddress.trim());
    formDataPassport.append("city", data?.city.trim());
    formDataPassport.append("occupation", data?.occupation.trim());
    formDataPassport.append("postalCode", data?.postalCode.trim());
    formDataPassport.append("state", statecode);
    formDataPassport.append("addressCountry", addressCountry);
    formDataPassport.append("identificationNumber", "123456789");
    formDataPassport.append("emailAddress", data?.email.trim());
    formDataPassport.append("dateOfBirth", formatDate(data?.date));
    formDataPassport.append("dateOfBirthFormattedString", data?.date.trim());
    formDataPassport.append("driversLicence", data?.docFile);
    formDataPassport.append("identificationType", "ssn");
    formDataPassport.append("passport", data?.picture);
    formDataPassport.append("identityType", data?.idType);

    dispatch({ type: LOADING });
    try {
      const result = await kycService.Kyc(formDataSsn, country);
      dispatch({
        type: KYC_VERIFICATION,
        payload: result,
        fullKyc: false,
      });
      if (result?.sessionUrl) {
        window.open(result?.sessionUrl, "_blank");
      }
      dispatch(fetchProfile());
    } catch (err) {
      const message = err?.response?.data?.message;
      dispatch({
        type: ERROR,
        payload: message || generalErrMsg,
      });
      error("Error!", message || generalErrMsg);
    }
  };

export const kycVerificationMigration =
  (data, profile, details) => async (dispatch) => {
    console.log(details);
    let formDataPassport = new FormData();
    formDataPassport.append("identificationNumber", details.passport?.trim());
    formDataPassport.append("dateOfBirth", formatDate(details?.dob));
    formDataPassport.append("dateOfBirthFormattedString", details?.dob);
    formDataPassport.append("driversLicence", details?.passportDoc);
    formDataPassport.append("identificationType", "driversLicence");

    let formDataSSn = new FormData();
    formDataSSn.append("dateOfBirth", formatDate(details?.dob));
    formDataSSn.append("dateOfBirthFormattedString", details?.dob);
    formDataSSn.append("identificationType", details?.idType);
    formDataSSn.append("driversLicence", details?.passportDoc);
    formDataSSn.append("socialSecurityNumber", details?.ssn?.trim());

    dispatch({ type: LOADING });
    try {
      const result = await kycService.migrationUpdate(
        details.passport ? formDataPassport : formDataSSn,
        profile?.country
      );
      dispatch(fetchProfile());
      success(
        "Success",
        "Your information to get a new 4Traderx USD bank account has been updated successfully."
      );
    } catch (err) {
      const message = err?.response?.data?.message;
      dispatch({
        type: ERROR,
        payload: message || generalErrMsg,
      });
      error("Error!", message || generalErrMsg);
    }
  };

export const kycBusinessVerification =
  (data, country, addressCountry, statecode) => async (dispatch) => {
    const state = country === "UNITED_STATES" ? statecode : data?.state.trim();
    let formData = new FormData();

    let address = {
      addressType: data?.streetAddress,
      line1: data?.phone,
      line2: data?.phone,
      city: data?.city,
      state: state,
      country: country,
      postalCode: data?.postalCode,
    };

    formData.append("legalName", data?.bname);
    formData.append("entityType", data?.bType);
    formData.append("dba", data?.dba);
    formData.append("email", data?.fname.trim());
    formData.append("phone", data?.fname.trim());
    formData.append("formationDate", data?.date);
    formData.append("website", data?.website);
    formData.append("about", data?.about);
    formData.append("industry", data?.fname.trim());
    formData.append("industry", data?.bType);
    formData.append("address", {
      ...address,
      state: state,
    });

    const dataBusiness = {
      legalName: data?.bname,
      entityType: data?.bType,
      dba: data?.dba,
      email: data?.email,
    
      phone: data?.bphone,
      formationDate: data?.date,
      website: data?.website,
      about: data?.about,
      industry: data?.industry,
      address: {
        addressType: "mailing",
        line1: "string",
        line2: "string",
        city: "string",
        state: "string",
        country: "string",
        postalCode: "string",
      },
    };

    // formData.append("firstName", data?.fname.trim());
    // formData.append("firstName", data?.fname.trim());
    // formData.append("lastName", data?.lname.trim());
    // formData.append("phoneNumber", data.phone + "+" + data?.phone.trim());
    // formData.append("streetAddress", data?.streetAddress.trim());
    // formData.append("city", data?.city.trim());
    // formData.append("postalCode", data?.postalCode.trim());
    // // formData.append("state", data?.state.trim());
    // formData.append("state", state);
    // formData.append("socialSecurityNumber", data?.ssn.trim());
    // formData.append("emailAddress", data?.email.trim());
    // formData.append("dateOfBirth", formatDate(data?.dob));
    // formData.append("dateOfBirthFormattedString", data?.dob.trim());
    // formData.append("driversLicence", data?.driversLicence);
    // formData.append("driversLicence", data?.passport);

    // dispatch({ type: LOADING });
    try {
      const result = await kycService.usaKybNew(dataBusiness);
      dispatch({
        type: KYC_VERIFICATION,
        payload: result,
        fullKyc: true,
      });
      // redirect business to kyc page
      if (result?.sessionUrl) {
        window.open(result?.sessionUrl, "_blank");
      }
      dispatch(fetchProfile());
      success("Success");
    } catch (err) {
      const message = err?.response?.data?.message;
      dispatch({
        type: ERROR,
        payload: message || generalErrMsg,
      });
      error("Error!", message || generalErrMsg);
    }
  };

export const kycVerificationNigeria = (data, country) => async (dispatch) => {
  let formData = new FormData();
  const newPhoneNumber = 234 + data?.phone;
  formData.append("firstName", data?.fname.trim());
  formData.append("lastName", data?.lname.trim());
  formData.append("identificationNumber", data?.idNumber.trim());
  formData.append("postalCode", data?.postalCode.trim());
  formData.append("houseNo", data?.houseNo.trim());
  formData.append("phoneNumber", newPhoneNumber.replace("+", ""));
  formData.append("streetAddress", data?.streetAddress.trim());
  formData.append("city", data?.city.trim());
  formData.append("state", data?.state.trim());
  formData.append("emailAddress", data?.email.trim());
  formData.append("dateOfBirth", formatDate(data?.dob));
  formData.append("dateOfBirthFormattedString", data?.dob.trim());
  formData.append(
    "bankVerificationNumber",
    data?.bankVerificationNumber.trim()
  );
  formData.append("occupation", data?.occupation.trim());
  formData.append("identificationType", data?.identificationType.trim());
  formData.append("passport", data?.passport);
  formData.append("identificationDocument", data?.identificationDocument);

  dispatch({ type: LOADING });
  try {
    const result = await kycService.Kyc(formData, country);
    dispatch({
      type: KYC_VERIFICATION,
      payload: result,
    });
    dispatch(fetchProfile());
    success("Success");
  } catch (err) {
    const message = err?.response?.data?.message;
    dispatch({
      type: ERROR,
      payload: message || generalErrMsg,
    });
    error("Error!", message || generalErrMsg);
  }
};

export const resetConfirmKyc = () => async (dispatch) => {
  dispatch({ type: RESET_CONFIRM_KYC });
};

export const kycVerificationNigeriaBusiness =
  (data, url) => async (dispatch) => {
    let formData = new FormData();
    formData.append("contactPersonFirstName", data?.fname.trim());
    formData.append("contactPersonLastName", data?.lname.trim());
    formData.append("phoneNumber", data?.phone.trim());
    formData.append("contactPersonPhoneNumber", data?.phone.trim());
    formData.append("streetAddress", data?.streetAddress.trim());
    formData.append("city", data?.city.trim());
    formData.append("state", data?.state.trim());
    formData.append("emailAddress", data?.email.trim());
    formData.append("dateOfBirth", formatDate(data?.dob));
    formData.append("dateOfBirthFormattedString", data?.dob.trim());
    formData.append("businessName", data?.businessName.trim());
    formData.append(
      "contactPersonBankVerificationNumber",
      data?.bankVerificationNumber.trim()
    );
    formData.append("cacRegistrationNumber", data?.cac.trim());
    formData.append("taxIdentificationNumber", data?.tin.trim());
    formData.append("contactPersonPassport", data?.picture);
    formData.append("cacDocument", data?.cacDoc);

    dispatch({ type: LOADING });
    try {
      const result = await kycService.ngaKyb(formData, url);
      dispatch({
        type: KYC_VERIFICATION,
        payload: result,
      });
      dispatch(fetchProfile());
      success("Success");
    } catch (err) {
      const message = err?.response?.data?.message;
      dispatch({
        type: ERROR,
        payload: message || generalErrMsg,
      });
      error("Error!", message || generalErrMsg);
    }
  };

export const verificationDetails = () => async (dispatch) => {
  dispatch({ type: LOADING });
  try {
    const result = await kycService.verificationDetails();
    dispatch({
      type: VERIFICATION_DETAILS,
      payload: result,
    });
  } catch (err) {
    const message = err?.response?.data?.message;
    dispatch({
      type: ERROR,
      payload: message || generalErrMsg,
    });
    error("Error!", message || generalErrMsg);
  }
};

export const verificationDetailsKyc = () => async (dispatch) => {
  dispatch({ type: LOADING });
  try {
    const result = await kycService.verificationDetailsKYC();
    dispatch({
      type: VERIFICATION_DETAILS_KYC,
      payload: result,
    });
  } catch (err) {
    const message = err?.response?.data?.message;
    dispatch({
      type: ERROR,
      payload: message || generalErrMsg,
    });
    error("Error!", message || generalErrMsg);
  }
};

export const migrateUser =
  (last4Digits, dob, ssnStatus, dobStatus) => async (dispatch) => {
    dispatch({ type: LOADING });
    try {
      const result = await kycService.userMigration(
        last4Digits,
        dob,
        ssnStatus,
        dobStatus
      );
      dispatch({
        type: ACCOUNT_MIGRATION,
        payload: result,
      });
      success("Success!", "Success");
      dispatch(fetchProfile());
      dispatch(fetchAccounts());
    } catch (err) {
      const message = err?.response?.data?.message;
      dispatch({
        type: ERROR,
        payload: message || generalErrMsg,
      });
      error("Error!", message || generalErrMsg);
    }
  };

export const kycVerificationCard = (data, doc) => async (dispatch) => {
  console.log(data);
  let formData = new FormData();
  formData.append("city", data?.city);
  formData.append("houseNo", data?.houseNo);
  formData.append("state", data?.state);
  formData.append("identificationNumber", data?.identificationNumber);
  formData.append("streetAddress", data?.streetAddress);
  formData.append("postalCode", data?.postalCode);
  formData.append("identificationDocument", doc);
  formData.append("identificationType", data?.identificationType);
  dispatch({ type: LOADING });
  try {
    const result = await kycService.kycVerificationCard(formData);
    success("Success!", "Success");
    setTimeout(() => {
      window.location.href = "/home";
    }, 800);
  } catch (err) {
    const message = err?.response?.data?.message;
    dispatch({
      type: ERROR,
      payload: message || generalErrMsg,
    });
    error("Error!", message || generalErrMsg);
  }
};

export const resetKyc = () => async (dispatch) => {
  dispatch({ type: RESET_KYC });
};

export const getUserStates = (country) => async (dispatch) => {
  dispatch({ type: LOADING });
  try {
    const result = await kycService.getStates(country);
    dispatch({
      type: KYC_STATES,
      payload: result,
    });
  } catch (err) {
    const message = err?.response?.data?.message;
    dispatch({
      type: ERROR,
      payload: message || generalErrMsg,
    });
    error("Error!", message || generalErrMsg);
  }
};
