import { Toast } from "bootstrap";

export function showToastMessage(message, type = "success" ,store) {
  if (type === "success") {
    store.dispatch("successMsg", message);
  } else if (type === "error") {
    store.dispatch("failedMsg", message);
  }
  
  const toast = new Toast(document.querySelector(".toast"));
  toast.show(); 
}
