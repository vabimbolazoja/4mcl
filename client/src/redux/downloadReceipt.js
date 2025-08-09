import axios from "axios";
import config from "../config";

export const downloadReceipt = (reference) => {
    axios(
      `${config?.baseUrl}/api/v1/receipt/download/withdrawal-transaction/${reference}/pdf`,
      {
        method: "GET",
        responseType: "blob", //Force to receive data in a Blob Format
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      }
    )
      .then((response) => {
        const file = new Blob([response.data], { type: "application/pdf" });
        const fileURL = URL.createObjectURL(file);
        window.open(fileURL);
      })
      .catch((error) => {
        console.log(error);
      });
  };