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
        // Create Popup Element
        let popup = document.createElement('div');
        popup.classList.add("segmentify_logger_extension_popup");

        let popupContent = document.createElement('div');
        popupContent.classList.add('segmentify_logger_extension_popup-content');

        // Create Close Button
        let closeButton = document.createElement('button');
        closeButton.classList.add('segmentify_logger_extension_popup-close-btn');
        closeButton.textContent = '×';
        closeButton.addEventListener('click', function () {
            document.body.removeChild(popup);
        });
        popup.appendChild(closeButton);

        // Create Title Element
        let title = document.createElement('h3');
        title.textContent = 'Segmentify Requests';
        title.classList.add('segmentify_logger_extension_popup-title')
        popup.appendChild(title);

        // Create minimize button
        let minimizeButton = document.createElement('button');
        minimizeButton.textContent = '−';
        minimizeButton.classList.add('segmentify_logger_extension_popup-minimize-btn')
        let isMinimized = false;
        let originalHeight = popup.style.maxHeight;
        minimizeButton.addEventListener('click', function () {
            if (isMinimized) {
                popupContent.style.display = 'block';
                minimizeButton.textContent = '−';
                popup.style.width = '35vw';
                isMinimized = false;
            } else {
                popupContent.style.display = 'none';
                popup.style.width = '260px';
                minimizeButton.textContent = '+';
                isMinimized = true;
            }

            // Popup'ın durumunu local storage'a kaydet
            localStorage.setItem('segmentify_popup_state', isMinimized ? 'minimized' : 'expanded');
        });

        // Popup'ın durumunu local storage'dan al ve buna göre boyutlandır
        let storedState = localStorage.getItem('segmentify_popup_state');
        if (storedState === 'minimized') {
            popup.style.width = '260px';
            popupContent.style.display = 'none';
            minimizeButton.textContent = '+';
            isMinimized = true;
        }

        popup.appendChild(minimizeButton);

        // Create the filter input
        let filterDiv = document.createElement('div');
        filterDiv.style.position = 'relative';

        let filterInput = document.createElement('input');
        filterInput.classList.add('segmentify_logger_extension_popup-filter-input');
        filterInput.type = 'text';
        filterInput.placeholder = 'Filter by name...';
        filterDiv.appendChild(filterInput);
        popupContent.appendChild(filterDiv);

        // Create the filter container
        let filterContainer = document.createElement('div');
        filterContainer.classList.add('segmentify_logger_extension_popup-filter-container')
        popupContent.appendChild(filterContainer);

        // Filter options
        let filterOptions = ['PAGE_VIEW', 'PRODUCT_VIEW', 'BASKET_OPERATIONS', 'CHECKOUT', 'CUSTOM_EVENT', 'INTERACTION', 'SEARCH'];

        // Load saved filter settings
        self.config.savedFilters = JSON.parse(localStorage.getItem('segmentify_filters')) || filterOptions.reduce((acc, option) => {
            acc[option] = true;
            return acc;
        }, {});

        // Create checkboxes for filter options
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
        });

        let requestList = document.createElement('ul');
        requestList.classList.add('segmentify_logger_extension_popup-request-list')
        popupContent.appendChild(requestList);

        popup.appendChild(popupContent);

        // Append the popup to the body
        document.body.appendChild(popup);
        self.config.filterInput = filterInput;
        self.config.requestList = requestList;
        self.config.popupElement = popup;

    },

    addStyles: function () {
        let self = SegmentifyLoggerExtension;

        // Add CSS to make summary background red on hover
        let style = document.createElement('style');
        style.textContent = `
       .segmentify_logger_extension_popup {
           position: fixed;
           top: 16px;
           right: 16px;
           padding: 16px;
           border-radius: 8px;
           box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
           background-color: #fff;
           z-index: 9999999999;
           width: 35vw;
           max-height: 70vh;
           overflow-y: auto;
           font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", "Noto Sans", "Liberation Sans", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
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
       }
       
       .segmentify_logger_extension_popup-filter-input {
           all: unset;
           margin-bottom: 16px;
           width: 100%;
           padding: 8px;
           box-sizing: border-box;
       }
       
       .segmentify_logger_extension_popup-filter-container {
           margin-bottom: 16px;
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
           background-color: #fff;
           background-clip: padding-box;
           border: 1px solid #ced4da;
           appearance: none;
           border-radius: 4px;
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
                console.log(request);
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

        // start

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
                                title = `${item.name} - ${item.category}`;
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
                } catch (e) {
                    console.error('Failed to parse payload:', e);
                }
            }
            originalXHRSend.apply(this, arguments);
        };

        // Add event listener to filter input
        self.config.filterInput.addEventListener('input', self.updateRequestListBox);
        // enc

    },

    syntaxHighlight(json) {
        if (typeof json != 'string') {
            json = JSON.stringify(json, undefined, 2);
        }
        json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

        // Check if JSON contains any of the specified keys
        let hasKeys = /("name":|"category":|"subCategory":|"productId":|"userId":|"sessionId":|"type":)/.test(json);

        // Highlighting JSON content
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

            // If JSON contains any of the specified keys and this match is one of them, set background color to black
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

        // Drag Drop
        const draggable = document.querySelector(".segmentify_logger_extension_popup");
        const ignoreElements = document.querySelectorAll(".segmentify_logger_extension_popup ul, .segmentify_logger_extension_popup .segmentify_logger_extension_popup-minimize-btn, .segmentify_logger_extension_popup .segmentify_logger_extension_popup-close-btn");


        let offsetX = 0, offsetY = 0;
        let isDragging = false;

        draggable.addEventListener("mousedown", function (e) {
            if (self.isIgnoreElement(e.target, ignoreElements)) {
                return;
            }
            // Sürükleme başlatıldı
            isDragging = true;
            offsetX = e.clientX - draggable.getBoundingClientRect().left;
            offsetY = e.clientY - draggable.getBoundingClientRect().top;
            draggable.style.cursor = "grabbing";
        });

        document.addEventListener("mousemove", function (e) {
            if (isDragging) {
                // Elemanı yeni konumuna taşımak
                draggable.style.left = e.clientX - offsetX + "px";
                draggable.style.top = e.clientY - offsetY + "px";
            }
        });

        document.addEventListener("mouseup", function () {
            // Sürükleme sonlandırıldı
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

// Initialize SegmentifyLoggerExtension
SegmentifyLoggerExtension.init();