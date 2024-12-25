"use strict";

console.log("Hello, world from popup!")

function setBadgeText(enabled) {
    const text = enabled ? "ON" : "OFF"
    void chrome.action.setBadgeText({ text: text })
}

// Handle the ON/OFF switch
const checkbox = document.getElementById("enabled")
chrome.storage.sync.get("enabled", (data) => {
    checkbox.checked = !!data.enabled
    void setBadgeText(data.enabled)
})
checkbox.addEventListener("change", (event) => {
    if (event.target instanceof HTMLInputElement) {
        void chrome.storage.sync.set({ "enabled": event.target.checked })
        void setBadgeText(event.target.checked)
    }
})

// Handle the input field
// const input = document.getElementById("item")
// chrome.storage.sync.get("item", (data) => {
//     input.value = data.item || ""
// });
// input.addEventListener("change", (event) => {
//     if (event.target instanceof HTMLInputElement) {
//         void chrome.storage.sync.set({ "item": event.target.value })
//     }
// })

// Sayfayı blur etmek için gerekli kod
//  document.addEventListener('DOMContentLoaded', function () {
//       //Aktif sekmenin içeriğini al
//      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
//           //Aktif sekmenin body elementini bul ve blur ekleyin
//          chrome.scripting.executeScript({
//              target: { tabId: tabs[0].id },
//              function: () => {
//                  document.body.style.filter = "blur(4px)";
//              }
//          });
//      });
//  });