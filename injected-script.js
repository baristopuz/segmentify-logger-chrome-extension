let SegmentifyLoggerExtension = {
    config: {
        popupSelector: '.segmentify_logger_extension_popup',
        requestList: null,
        requests: [],
        popupElement: null,
        filterInput: null,
        savedFilters: [],
        waitCount: 0
    },

    createPopupElements: function () {
        let self = SegmentifyLoggerExtension;

        let popup = document.createElement('div');
        popup.classList.add("segmentify_logger_extension_popup");

        let popupContent = document.createElement('div');
        popupContent.classList.add('segmentify_logger_extension_popup-content');

        let closeButton = document.createElement('button');
        closeButton.classList.add('segmentify_logger_extension_popup-close-btn');
        closeButton.textContent = '×';
        closeButton.addEventListener('click', function () {
            document.body.removeChild(popup);
        });
        popup.appendChild(closeButton);

        let title = document.createElement('h3');
        title.textContent = 'Segmentify Requests';
        title.classList.add('segmentify_logger_extension_popup-title')
        popup.appendChild(title);

        let minimizeButton = document.createElement('button');
        minimizeButton.textContent = '−';
        minimizeButton.classList.add('segmentify_logger_extension_popup-minimize-btn')
        let isMinimized = false;
        let originalHeight = popup.style.maxHeight;

        minimizeButton.addEventListener('click', function () {
            if (isMinimized) {
                popupContent.style.display = 'block';
                minimizeButton.textContent = '−';
                popup.classList.remove('popup-minimized');
                popup.classList.add('popup-show');
                isMinimized = false;
            } else {
                popupContent.style.display = 'none';
                minimizeButton.textContent = '+';
                popup.classList.remove('popup-show');
                popup.classList.add('popup-minimized');
                isMinimized = true;
            }

            localStorage.setItem('segmentify_popup_state', isMinimized ? 'minimized' : 'expanded');
        });

        let storedState = localStorage.getItem('segmentify_popup_state');
        if (storedState === 'minimized') {
            popupContent.style.display = 'none';
            minimizeButton.textContent = '+';
            isMinimized = true;
        }

        popup.appendChild(minimizeButton);

        let filterDiv = document.createElement('div');
        filterDiv.style.position = 'relative';

        let filterInput = document.createElement('input');
        filterInput.classList.add('segmentify_logger_extension_popup-filter-input');
        filterInput.type = 'text';
        filterInput.placeholder = 'Filter by name...';
        filterDiv.appendChild(filterInput);
        popupContent.appendChild(filterDiv);

        let filterContainer = document.createElement('div');
        filterContainer.classList.add('segmentify_logger_extension_popup-filter-container')
        popupContent.appendChild(filterContainer);

        // let filterOptions = ['PAGE_VIEW', 'INTERACTION'];
        let filterOptions = ['PAGE_VIEW', 'PRODUCT_VIEW', 'BASKET_OPERATIONS', 'CHECKOUT', 'CUSTOM_EVENT', 'INTERACTION', 'SEARCH'];


        self.config.savedFilters = JSON.parse(localStorage.getItem('segmentify_filters')) || filterOptions.reduce((acc, option) => {
            acc[option] = true;
            return acc;
        }, {});

        filterOptions.forEach(function (option) {
            let div = document.createElement('div');
            div.classList.add('checkbox-wrapper-2');

            let span = document.createElement('span');

            let label = document.createElement('label');
            label.style.display = 'inline-flex';
            label.style.justifyContent = 'center';
            label.style.alignItems = 'center';
            label.style.gap = '8px';
            label.style.fontWeight = '400';
            let checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.classList.add('ikxBAC');
            checkbox.checked = self.config.savedFilters[option];
            checkbox.addEventListener('change', function () {
                self.config.savedFilters[option] = checkbox.checked;
                localStorage.setItem('segmentify_filters', JSON.stringify(self.config.savedFilters));
                self.updateRequestList();
            });
            label.appendChild(checkbox);
            span.appendChild(document.createTextNode(option));
            label.appendChild(span);
            div.appendChild(label);
            filterContainer.appendChild(div);

            let responseCheckbox = document.createElement('input');
            responseCheckbox.type = 'checkbox';
            responseCheckbox.classList.add('ikxBAC');
        });

        let requestList = document.createElement('ul');
        requestList.classList.add('segmentify_logger_extension_popup-request-list')
        popupContent.appendChild(requestList);

        let responseList = document.createElement('ul');
        responseList.classList.add('segmentify_logger_extension_popup-response-list')
        popupContent.appendChild(responseList);

        popup.appendChild(popupContent);

        document.body.appendChild(popup);
        self.config.filterInput = filterInput;
        self.config.requestList = requestList;
        self.config.popupElement = popup;

    },

    addStyles: function () {
        let self = SegmentifyLoggerExtension;

        let style = document.createElement('style');
        style.textContent = `
       .segmentify_logger_extension_popup {
            position: fixed;
            top: 16px;
            right: 16px;
            padding: 16px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            background-color: rgba(255,255,255,0.6);
            backdrop-filter: blur(20px);
            z-index: 9999999999;
            max-height: 70vh;
            overflow-y: auto;
            font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", "Noto Sans", "Liberation Sans", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
            backdrop-filter: saturate(180%) blur(20px);
            width: 260px;
       }

        .segmentify_logger_extension_popup.popup-minimized {
            width: 260px;
        }

        .segmentify_logger_extension_popup.popup-show {
            width: 500px;
        }
       
       .segmentify_logger_extension_popup *{ 
           font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", "Noto Sans", "Liberation Sans", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"!important;
       }
       
       .segmentify_logger_extension_popup .segmentify_logger_extension_popup-close-btn {
           position: absolute;
           top: 8px;
           right: 8px;
           border: none;
           background-color: transparent;
           color: #999;
           font-size: 24px;
           cursor: pointer;
           outline:none!important;
           z-index: 99999;
       }
       
       .segmentify_logger_extension_popup-title {
           margin: 0!important;
           font-size: 16px!important;
           font-weight: 600!important;
       }

       .segmentify_logger_extension_popup-content {
           margin-top: 16px;
       }
       
       .segmentify_logger_extension_popup-minimize-btn {
           position: absolute;
           top: 8px;
           right: 32px;
           border: none;
           background-color: transparent;
           color: #999;
           font-size: 24px;
           cursor: pointer;
           outline:none!important;
           z-index: 99999;
       }
       
       .segmentify_logger_extension_popup-filter-input {
           all: unset;
           margin-bottom: 16px;
           width: 100%;
           padding: 8px;
           box-sizing: border-box;
       }
       
       .segmentify_logger_extension_popup-filter-container {
           display: flex;
           gap: 8px;
           flex-wrap: wrap;
           font-size: 12px;
           padding-left: 10px;
       }
  
       .segmentify_logger_extension_popup-filter-container .checkbox-wrapper-2 {
           min-width: 130px;
       }
       
       .segmentify_logger_extension_popup input {
           padding: 6px 12px;
           font-size: 16px;
           font-weight: 400;
           line-height: 1.5;
           color: #212529;
           background-color: transparent;
           background-clip: padding-box;
           border: 1px solid #ced4da;
           appearance: none;
           border-radius: 4px;
           border: 1px dashed #000;
           transition: border-color .15s ease-in-out,box-shadow .15s ease-in-out;
       }
       
       .segmentify_logger_extension_popup input:focus{
           color: #212529;
           border-color: #86b7fe;
           outline: 0;
           box-shadow: 0 0 0 4px rgb(13 110 253 / 25%);
       }
       
       .segmentify_logger_extension_popup details summary {
           transition: 200ms ease background-color, 200ms ease color;
       }
       
       .segmentify_logger_extension_popup details summary:hover {
           background-color: #6e79d6;
           color: #f1faee;
       }
       
       .segmentify_logger_extension_popup .checkbox-wrapper-2 .ikxBAC {
           appearance: none;
           background-color: #dfe1e4;
           border-radius: 72px;
           border-style: none;
           flex-shrink: 0;
           height: 20px;
           margin: 0;
           position: relative;
           width: 30px;
           background-image:none;
       }
       
       .segmentify_logger_extension_popup .checkbox-wrapper-2 .ikxBAC::before {
           bottom: -6px;
           content: "";
           left: -6px;
           position: absolute;
           right: -6px;
           top: -6px;
       }
       
       .segmentify_logger_extension_popup .checkbox-wrapper-2 .ikxBAC,
       .segmentify_logger_extension_popup .checkbox-wrapper-2 .ikxBAC::after {
           transition: all 100ms ease-out;
       }
       
       .segmentify_logger_extension_popup .checkbox-wrapper-2 .ikxBAC::after {
           background-color: #fff;
           border-radius: 50%;
           content: "";
           height: 14px;
           left: 3px;
           position: absolute;
           top: 3px;
           width: 14px;
       }
       
       .segmentify_logger_extension_popup .checkbox-wrapper-2 input[type=checkbox] {
           cursor: default;
       }
       
       .segmentify_logger_extension_popup .checkbox-wrapper-2 .ikxBAC:hover {
           background-color: #c9cbcd;
           transition-duration: 0s;
       }
       
       .segmentify_logger_extension_popup .checkbox-wrapper-2 .ikxBAC:checked {
           background-color: #6e79d6;
       }
       
       .segmentify_logger_extension_popup .checkbox-wrapper-2 .ikxBAC:checked::after {
           background-color: #fff;
           left: 13px;
       }
       
       .segmentify_logger_extension_popup .checkbox-wrapper-2 :focus:not(.focus-visible) {
           outline: 0;
       }
       
       .segmentify_logger_extension_popup .checkbox-wrapper-2 .ikxBAC:checked:hover {
           background-color: #535db3;
       }
  
       .segmentify_logger_extension_popup ul {
           list-style-type: none!important;
           padding-left: 0px!important;
       }
       
       .segmentify_logger_extension_popup pre {
           outline: 1px solid #ccc;
           padding: 5px;
           margin: 5px;
           overflow-x: auto;
           font-size: 12px;
       }
       
       .segmentify_logger_extension_popup .string {
           color: green;
       }
       
       .segmentify_logger_extension_popup .number {
           color: darkorange;
       }
       
       .segmentify_logger_extension_popup .boolean {
           color: blue;
       }
       
       .segmentify_logger_extension_popup .null {
           color: magenta;
       }
       
       .segmentify_logger_extension_popup .key {
           color: red;
       }
       
       .segmentify_logger_extension_popup summary {
           cursor: pointer;
           padding: 10px;
           font-size: 13px;
       }

        @media screen and (min-width:1921px) {
            .segmentify_logger_extension_popup, .segmentify_logger_extension_popup.popup-minimized {
                width: 450px;
            }
        }
       
   `;

        document.head.appendChild(style);
    },

    updateRequestListBox: function () {
        let self = SegmentifyLoggerExtension;

        let filter = self.config.filterInput.value.toLowerCase();

        self.config.requestList.innerHTML = '';
        self.config.requests.forEach(function (request) {
            if (request.instanceId.toLowerCase().includes(filter)) {
                self.config.requestList.appendChild(request.element);
            }
        });
    },

    updateRequestList: function () {
        let self = SegmentifyLoggerExtension;

        self.config.requestList.innerHTML = '';
        self.config.requests.forEach(function (request) {
            let include = false;
            request.items.forEach(function (item) {
                if (self.config.savedFilters[item.name]) {
                    include = true;
                }
            });
            if (include) {
                self.config.requestList.appendChild(request.element);
            }
        });
    },

    watchRequests: function () {
        let self = SegmentifyLoggerExtension;

        // Intercept and log XHR self.config.requests to segmentify.com
        let originalXHROpen = XMLHttpRequest.prototype.open;
        let originalXHRSend = XMLHttpRequest.prototype.send;

        XMLHttpRequest.prototype.open = function (method, url) {
            this.isSegmentifyRequest = url.includes('segmentify.com');
            originalXHROpen.apply(this, arguments);
        };

        XMLHttpRequest.prototype.send = function (body) {
            if (this.isSegmentifyRequest && body) {
                try {
                    let payload = JSON.parse(body);
                    if (Array.isArray(payload)) {
                        let instanceId = payload.map(function (item) {
                            return item.instanceId ?? item.name;
                        }).join(', ');

                        let listItem = document.createElement('li');

                        payload.forEach(function (item) {

                            let suankiTarih = new Date();
                            let saat = suankiTarih.getHours();
                            let dakika = suankiTarih.getMinutes();
                            let saniye = suankiTarih.getSeconds();

                            let payloadDetails = document.createElement('details');
                            let payloadSummary = document.createElement('summary');
                            let title = '';
                            if (item.name === 'PAGE_VIEW') {
                                title = `${item.name} - ${item.category} ${(item.subCategory)? `subCat:(${item.subCategory})` : ''}`;
                            } else if (item.name === 'INTERACTION') {
                                title = `${item.name} - ${item.type} - ${item.instanceId}`;
                            } else if (item.name === 'CUSTOM_EVENT') {
                                title = `${item.name} - ${item.type}`;
                            } else if (item.name === 'BASKET_OPERATIONS' || item.name === 'CHECKOUT') {
                                title = `${item.name} - ${item.step}`;
                            } else if (item.name === 'PRODUCT_VIEW') {
                                title = `${item.name} - ${item.productId}`;
                            } else if (item.name === 'SEARCH') {
                                title = `SEARCHANDISING - ${item.query ?? 'BEFORE_SEARCH'}`;
                            } else {
                                title = item.name;
                            }

                            title += ` - (${saat}:${dakika}:${saniye})`;

                            payloadSummary.textContent = title;
                            let payloadContent = document.createElement('pre');
                            payloadContent.innerHTML = self.syntaxHighlight(JSON.stringify(item, null, 2));
                            payloadContent.style.whiteSpace = 'pre-wrap';
                            payloadContent.style.marginTop = '8px';

                            payloadDetails.appendChild(payloadSummary);
                            payloadDetails.appendChild(payloadContent);
                            listItem.appendChild(payloadDetails);
                        });

                        self.config.requests.push({ instanceId: instanceId, element: listItem, items: payload });
                        self.updateRequestListBox();
                        self.updateRequestList();
                    }

                    this.addEventListener('load', function () {
                        try {
                            SegmentifyLoggerExtension.addResponseToPopup(this.responseURL, this.responseText);

                        } catch (e) {
                            console.error('Failed to log response:', e);
                        }
                    });
                } catch (e) {
                    console.error('Failed to parse payload:', e);
                }
            }
            originalXHRSend.apply(this, arguments);
        };

        self.config.filterInput.addEventListener('input', self.updateRequestListBox);
    },

    syntaxHighlight(json) {
        if (typeof json != 'string') {
            json = JSON.stringify(json, undefined, 2);
        }
        json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

        let hasKeys = /("name":|"category":|"subCategory":|"productId":|"userId":|"sessionId":|"type":)/.test(json);

        json = json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
            let cls = 'number';
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = 'key';
                } else {
                    cls = 'string';
                }
            } else if (/true|false/.test(match)) {
                cls = 'boolean';
            } else if (/null/.test(match)) {
                cls = 'null';
            }

            if (hasKeys && (match.includes('"productId"') || match.includes('"category"') || match.includes('"subCategory"') || match.includes('"userId"') || match.includes('"sessionId"') || match.includes('"name"') || match.includes('"type"'))) {
                return '<span style="background-color: black; color: white;">' + match + '</span>';
            } else {
                return '<span class="' + cls + '">' + match + '</span>';
            }
        });

        return json;
    },

    isIgnoreElement(target, elements) {
        for (let i = 0; i < elements.length; i++) {
            if (elements[i].contains(target)) {
                return true;
            }
        }
        return false;
    },

    activeDragDrop: function () {
        let self = SegmentifyLoggerExtension;

        const draggable = document.querySelector(".segmentify_logger_extension_popup");
        const ignoreElements = document.querySelectorAll(".segmentify_logger_extension_popup ul, .segmentify_logger_extension_popup .segmentify_logger_extension_popup-minimize-btn, .segmentify_logger_extension_popup .segmentify_logger_extension_popup-close-btn");

        let offsetX = 0, offsetY = 0;
        let isDragging = false;

        draggable.addEventListener("mousedown", function (e) {
            if (self.isIgnoreElement(e.target, ignoreElements)) {
                return;
            }
            isDragging = true;
            offsetX = e.clientX - draggable.getBoundingClientRect().left;
            offsetY = e.clientY - draggable.getBoundingClientRect().top;
            draggable.style.cursor = "grabbing";
        });

        document.addEventListener("mousemove", function (e) {
            if (isDragging) {
                draggable.style.left = e.clientX - offsetX + "px";
                draggable.style.top = e.clientY - offsetY + "px";
            }
        });

        document.addEventListener("mouseup", function () {
            isDragging = false;
            draggable.style.cursor = "pointer";
        });

    },

    waitForDependencies: function () {
        let self = SegmentifyLoggerExtension;
        if (document.body && window['_SgmntfY_']) {
            self.createPopupElements();

            if (self.config.popupElement !== null) {
                try {
                    self.addStyles();
                    self.watchRequests();
                    self.activeDragDrop();
                    window['segmentify_logger_extension'] = self;
                } catch (error) {
                    console.error(error);
                }
            }

        } else {
            self.config.waitCount++;
            if (self.config.waitCount < 75) {
                setTimeout(function () { self.waitForDependencies(); }, 75);
            }
        }
    },

    init: function () {
        SegmentifyLoggerExtension.waitForDependencies();
    }
};


SegmentifyLoggerExtension.addResponseToPopup = function (url, responseText) {
    try {
        let jsonResponse = JSON.parse(responseText);

        // Filtreleme işlemi: Her response içindeki objeleri kontrol et
        let recommendProductsResponses = jsonResponse.responses
            .flatMap(response => {
                // Eğer response bir dizi ise
                if (Array.isArray(response)) {
                    // İçindeki objeleri kontrol et
                    return response.filter(item => item.type === "recommendProducts");
                }
                return [];
            });

        if (recommendProductsResponses.length === 0) return;

        let responseList = document.querySelector('.segmentify_logger_extension_popup-response-list');
        if (!responseList) {
            responseList = document.createElement('ul');
            responseList.classList.add('segmentify_logger_extension_popup-response-list');
            SegmentifyLoggerExtension.config.popupElement.appendChild(responseList);
        }

        recommendProductsResponses.forEach((response, index) => {
            let params = response.params || {};

            let totalObjects = 0;
            for (const key in params.recommendedProducts) {
                if (Array.isArray(params.recommendedProducts[key])) {
                    totalObjects += params.recommendedProducts[key].length;
                }
            }

            let li = document.createElement('li');
            let details = document.createElement('details');
            let summary = document.createElement('summary');
            summary.style.backgroundColor = 'rgba(0,0,0,0.2)';
            summary.style.color = '#000';
            summary.style.fontSize = '13px';
            summary.textContent = `Resp: ${params.notificationTitle} (${totalObjects}) -> ${params.instanceId}  `;

            let filteredParams = {
                notificationTitle: params.notificationTitle,
                instanceId: params.instanceId,
                recommendedProducts: params.recommendedProducts
            };

            // Create a new pre element to display the filtered params
            let pre = document.createElement('pre');
            pre.innerHTML = this.syntaxHighlight(JSON.stringify(filteredParams, null, 2));

            console.log(`%c Kampanya: ${filteredParams.notificationTitle} - (${filteredParams.instanceId})`, 'background: #222; color: #bada55; font-size: 14px;');
            console.log(filteredParams);

            details.appendChild(summary);
            details.appendChild(pre);
            li.appendChild(details);
            responseList.appendChild(li);
        });
    } catch (e) {
        console.error('Failed to parse or log response:', e);
    }
};


// Initialize SegmentifyLoggerExtension
SegmentifyLoggerExtension.init();
