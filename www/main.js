'use strict';

startSuffArray.sort((a, b) => Number(a.replace(/[^0-9]/g, '')) - Number(b.replace(/[^0-9]/g, '')));

const percentBarWarning = 90;

var activeTab = 0;
var currentTooltip = null;
var currentTooltipTarget = null;
var graphImgsObject = {};
var graphIntervalLinksObject = {};
var graphAttrsLinksObject = {};
var availableSmartAttrs = {};


function hideTooltip(ev) {
    if(!currentTooltip || (ev && (ev.target === currentTooltip || ev.relatedTarget === currentTooltip ||
        currentTooltip.contains(ev.target) || currentTooltip.contains(ev.relatedTarget)))) {
        return;
    };

    if(currentTooltipTarget) {
        currentTooltipTarget.classList.remove('tooltip-cell-hover');
    };

    currentTooltip.style.opacity = 0;
    currentTooltip.remove();
    currentTooltip = null;
}

function addTooltip(ev) {
    hideTooltip();

    let target = ev.target.closest('[data-tooltip]');
    if (!target) {
        return;
    };

    target.classList.add('tooltip-cell-hover');
    currentTooltipTarget = target;

    let rect = target.getBoundingClientRect(),
        x = rect.left + window.pageXOffset,
        y = rect.top + rect.height + window.pageYOffset;

    let tooltipDiv = document.createElement('div');
        tooltipDiv.className = 'tooltip';

    document.body.append(tooltipDiv);
    currentTooltip = tooltipDiv;

    if((y + tooltipDiv.offsetHeight) > (window.innerHeight + window.pageYOffset)) {
        y -= (tooltipDiv.offsetHeight + target.offsetHeight);
    }

    let dataHex = target.dataset.tooltipHex;

    if(dataHex) {
        let hexValue = Number(target.dataset.tooltip).toString(16).toUpperCase();

        try {
            hexValue = hexValue.padStart(dataHex, '0');
        } catch(e) {
            if(e.name != 'TypeError') {
                throw e;
            };
        };

        tooltipDiv.innerHTML = `hex: ${hexValue}`;
    } else {
        tooltipDiv.innerHTML = target.dataset.tooltip;
    };

    tooltipDiv.style.top = y + 'px';
    tooltipDiv.style.left = x + 'px';
    tooltipDiv.style.opacity = 1;
}


document.addEventListener('mouseover', function(ev) {
    let target = ev.target;
    if(target.dataset.tooltip) {
        addTooltip(ev);
    };
});

document.addEventListener('mouseout', hideTooltip);


function addTopScroll() {
    let tsContainer = document.createElement('div');
        tsContainer.className = 'top-scroll-container';

    let up = document.createElement('a');
        up.href = '#';
        up.textContent = '▲';
        up.className = 'top-scroll-btn';
        up.addEventListener('click', ev => {
            ev.preventDefault();
            window.scrollTo(0, 0);
        });

    let down = document.createElement('a');
        down.href = '#';
        down.textContent = '▼';
        down.className = 'top-scroll-btn';
        down.addEventListener('click', ev => {
            ev.preventDefault();
            window.scrollTo(0, Math.max(
                document.body.scrollHeight, document.documentElement.scrollHeight,
                document.body.offsetHeight, document.documentElement.offsetHeight,
                document.body.clientHeight, document.documentElement.clientHeight
            ))
        });

    tsContainer.append(up, down);
    document.body.append(tsContainer);
}

function initPercentBars() {
    let barContainers = document.querySelectorAll('*[data-bar]');
    for(let elem of barContainers) {
        let value = elem.dataset.bar;
        let barLine = document.createElement('div');
            barLine.className = 'percent-bar-line';
        let bar = document.createElement('div');
            bar.className = 'percent-bar';
            bar.title = value + "%";
            bar.append(barLine);
        barLine.style.width = value + "%";
        elem.innerHTML = null;
        elem.append(bar);

        if(value >= percentBarWarning) {
            barLine.classList.add('percent-bar-warning');
        };
    };
}

function showAlertPanel(style, msg) {
    document.getElementById('main-content').insertAdjacentHTML("afterBegin", '<div id="alert_panel" class="' + style + '">' + msg + '</div>');
}

function showCgiPanel() {
    document.getElementById('main-content').insertAdjacentHTML("afterBegin", `<div id="cgi_panel">
        <button onclick="sendCgiRequest('refresh', false); return false">Check now</button><!--
     --><button onclick="sendCgiRequest('resetwarn', false); return false">Reset warnings</button><!--
     --><button onclick="sendCgiRequest('resetcount', 'All S.M.A.R.T attribute counters will be reset...'); return false">Reset counters</button>
    </div>`);
}

function checkAlert() {
    switch(showAlert) {
        case 1 :
            showAlertPanel('degr', 'Warning! Some critical S.M.A.R.T attribute(s) has changed... (to reset this message: "smarthtml resetwarn")');
        break
        case 2 :
            showAlertPanel('thrshld', 'Warning! Some S.M.A.R.T attribute(s) have reached the threshold...');
        break
    };
}

function showGraph(device, attrId) {
    let container = document.querySelector('.graph-container[data-graph-device="' + device + '"');
    if(container) {

        let attrsLinks = container.querySelector('.attrs-links');

        graphAttrsLinksObject[device].forEach(a => {
            let li = document.createElement('li');
            li.append(a);
            attrsLinks.append(li);
        });

        let graphLinks = container.querySelector('.graph-links');
            graphLinks.innerHTML = null;
        graphIntervalLinksObject[device][attrId].forEach(a => {
            let li = document.createElement('li');
            li.append(a);
            graphLinks.append(li);
        });

        switchGraph(device, attrId, 0);
    };
}

function switchGraph(device, attrId, interval) {
    let container = document.querySelector('.graph-container[data-graph-device="' + device + '"');
    if(container) {
        let imgContainer =  container.querySelector('figure');
            imgContainer.innerHTML = null;
            imgContainer.append(graphImgsObject[device][attrId][interval]);

        for(let a of graphAttrsLinksObject[device]) {
            if(a.hasAttribute('data-graph-link-selected')) {
                a.removeAttribute('data-graph-link-selected');
            };
            if(a.dataset.linkAttr == attrId) {
                a.setAttribute('data-graph-link-selected', 'true');
            };
        };

        for(let a of graphIntervalLinksObject[device][attrId]) {
            if(a.hasAttribute('data-graph-link-selected')) {
                a.removeAttribute('data-graph-link-selected');
            };
            if(a.dataset.linkAttr == attrId) {
                a.setAttribute('data-graph-link-selected', 'true');
            };
        };

        graphIntervalLinksObject[device][attrId].forEach(a =>
            a.removeAttribute('data-graph-link-selected')
        );
        graphIntervalLinksObject[device][attrId][interval].setAttribute('data-graph-link-selected', 'true');
    };
}

function switchGraphHandler(ev) {
    let target = ev.target;
    let device = target.dataset.linkDevice;
    let attrId = target.dataset.linkAttr;
    let interval = target.dataset.linkInterval;
    switchGraph(device, attrId, interval);
    return false;
}

function initGraphs() {
    if(RRD_SMART_ATTRS.length == 0) {
        return;
    };
    let deviceSections = document.querySelectorAll('*[data-device]');
    for(let section of deviceSections) {
        let device = section.dataset.device;

        graphAttrsLinksObject[device] = [];
        graphImgsObject[device] = {};
        graphIntervalLinksObject[device] = {};
        availableSmartAttrs[device] = [];

        let smartAttrsCells = section.querySelectorAll('*[data-smart-attr]');

        for(let elem of smartAttrsCells) {
            let attrId = elem.dataset.smartAttr;

            if(RRD_SMART_ATTRS.includes(attrId) && !DISABLED_SMART_ATTRS.includes(attrId)) {
                graphIntervalLinksObject[device][String(attrId)] = [];
                graphImgsObject[device][String(attrId)] = [];
                availableSmartAttrs[device].push(attrId);

                for(let i = 0; i < startSuffArray.length; i++) {

                    let img = document.createElement('img');
                        img.className = 'smart-graph-img';
                        img.alt = '';
                        img.src = `${RRD_GRAPH_WWW_PATH}/${device}_${attrId}_${startSuffArray[i]}.${RRD_GRAPH_EXT}`;
                        img.setAttribute('data-img-attr-name', elem.textContent);
                        graphImgsObject[device][String(attrId)].push(img);

                    let intLink = document.createElement('a');
                        intLink.className = 'graph-interval-link';
                        intLink.href = '#';
                        intLink.setAttribute('data-link-device', device);
                        intLink.setAttribute('data-link-attr', attrId);
                        intLink.setAttribute('data-link-interval', i);
                        intLink.textContent = startSuffArray[i];
                        intLink.onclick = switchGraphHandler;

                        graphIntervalLinksObject[device][String(attrId)].push(intLink);
                };

                function onclickHandler(ev) {
                    ev.preventDefault();
                    showGraph(device, attrId);
                };

                let graphAttrLink = document.createElement('a');
                    graphAttrLink.href = '#';
                    graphAttrLink.title = "Show graph";
                    graphAttrLink.className = 'graph-attr-link';
                    graphAttrLink.setAttribute('data-link-attr', attrId);
                    graphAttrLink.textContent = elem.textContent;
                    graphAttrLink.onclick = onclickHandler;
                elem.innerHTML = null;
                elem.append(graphAttrLink);

                let graphAttrLinkClone = graphAttrLink.cloneNode(true);

                if(RRD_SMART_ATTRS_DIFF.includes(attrId)) {
                    graphAttrLinkClone.textContent = elem.textContent + ' / ' +
                        ((RRD_DB_STEP >= 86400) ? (RRD_DB_STEP / 86400) + 'd' :
                        (RRD_DB_STEP >= 3600) ? (RRD_DB_STEP / 3600) + 'h' :
                        (RRD_DB_STEP / 60) + 'm');
                };

                graphAttrLinkClone.onclick = onclickHandler;
                graphAttrsLinksObject[device].push(graphAttrLinkClone);
            };
        };

        for(let attrId of availableSmartAttrs[device]) {
            if(RRD_SMART_ATTRS_DEF_GRAPH.includes(attrId)) {
                showGraph(device, attrId);
            };
        };

    };
}

async function sendCgiRequest(call, isConfirm) {
    if(isConfirm && !confirm(isConfirm)) return;
    document.body.insertAdjacentHTML('afterBegin', '<div class="screen-locker"><span>Processing...</span></div>');
    await fetch(`${CGI_MODULE_WWW_PATH}?call=${call}`).then(response => {
        if(response.ok)
            window.location.reload(true);
        else {
            document.body.innerHTML = `<div class="screen-error">Server error!<br>${response.status}: ${response.statusText}</div>`;
        };
    }).catch(err => {
        document.body.innerHTML = `<div class="screen-error">Connection error!<br>${err.message}</div>`;
    });
}

function switchTab(tabLink) {
    let tabId = tabLink.dataset.tab;
    let currTab = document.querySelector('.tabs-container *[data-tab="' + tabId + '"]');

    if(currTab) {
        document.querySelectorAll('.tabs-container *[data-tab]').forEach(e => e.style.display = 'none');
        currTab.style.display = 'block';
        document.querySelectorAll('.tab-link').forEach(e => e.classList.remove('tab-link-active'));
        tabLink.classList.add('tab-link-active');
        activeTab = tabId;
    };
}

function switchTabHandler(ev) {
    ev.preventDefault();
    switchTab(ev.target);
}

function initTabs() {
    let panes = Array.from(document.querySelectorAll('.tabs-container *[data-tab]'));
    panes.sort((a, b) => a.dataset.tab > b.dataset.tab);

    if(panes.length === 0) {
        document.getElementById('main-content').insertAdjacentHTML(
            "afterBegin", '<p class="center"><em>No devices detected</em><p>');
        return;
    };

    let tabsLinks = panes.map(e => {
        let a = document.createElement('a');
            a.href = '#';
            a.className = 'tab-link';
            a.setAttribute('data-tab', e.dataset.tab);
            a.textContent = e.dataset.tabTitle;
            a.addEventListener('click', switchTabHandler);
        return a;
    })

    let tabsMenu = document.createElement('ul');
        tabsMenu.className = 'tabs-menu';

    tabsLinks.map(e => {
        let li = document.createElement('li');
            li.append(e);
        return li;
    }).forEach(e => tabsMenu.append(e));

    if(tabsLinks.length > 1) {
        let tabsNav = document.getElementById('tabs-nav');
            tabsNav.append(tabsMenu);
    };
    if(tabsLinks[0]) {
        switchTab(tabsLinks[activeTab]);
    };
}

function toDD(n){
    return String(n).replace(/^(\d)$/, "0$1");
};

function createSctTemp(device, dataSize, logInterval, deviceTime,
                        diskTempWarning, diskTempCritical, tempData) {

    if(!tempData || !dataSize || !logInterval || !deviceTime || !tempData) {
        return;
    };

    let intervalSec = logInterval * 60;
    let dataUnits = [];

    let i = dataSize - 1;
    while(i >= 0) {
        if(deviceTime % intervalSec === 0) {
            dataUnits.push([i, tempData[i], new Date(deviceTime * 1000)]);
            i--;
        };
        deviceTime--;
    };
    dataUnits.reverse();

    // GRAPH

    let svgWidth = 900;
    let svgHeight = 300;
    let tempValueMul = 3;                               // 1C == 3px
    let tempOffset = 0;                                 // lowest temp value: 0C
    let tempStep = 5;                                   // 5C step
    let timeStep = svgWidth / dataSize;
    let timeLineInterval = Math.ceil(dataSize / 32);    // 4 intervals (5 x 4 = 20 min)

    let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');
        svg.setAttribute('version', '1.1');
        svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

    // temperature line
    let tempLine = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
        tempLine.setAttribute('class', 'svg-temp-graph');
    let tempPoints = [[0, svgHeight]];

    for(let i = 0; i < dataSize; i++) {
        tempPoints.push([
            i * timeStep,
            (dataUnits[i][1] != null) ?
                (svgHeight - (dataUnits[i][1] - tempOffset) * tempValueMul) :
                    svgHeight * 2
        ]);
    };
    tempPoints.push([tempPoints[tempPoints.length - 1][0], svgHeight]);
    tempLine.setAttribute('points', tempPoints.map(e => e.join(',')).join(' '));
    svg.appendChild(tempLine);

    // temperature warning
    let lineW = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        lineW.setAttribute('x1', 0);
        lineW.setAttribute('y1', svgHeight - (diskTempWarning - tempOffset) * tempValueMul);
        lineW.setAttribute('x2', '100%');
        lineW.setAttribute('y2', svgHeight - (diskTempWarning - tempOffset) * tempValueMul);
        lineW.setAttribute('class', 'svg-temp-warning');
    svg.appendChild(lineW);

    // temperature critical
    let lineC = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        lineC.setAttribute('x1', 0);
        lineC.setAttribute('y1', svgHeight - (diskTempCritical - tempOffset) * tempValueMul);
        lineC.setAttribute('x2', '100%');
        lineC.setAttribute('y2', svgHeight - (diskTempCritical - tempOffset) * tempValueMul);
        lineC.setAttribute('class', 'svg-temp-critical');
    svg.appendChild(lineC);

    // time labels
    let j = 0;
    for(let i = 0; i < svgWidth; i += timeStep * timeLineInterval) {
        let line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', i);
            line.setAttribute('y1', 0);
            line.setAttribute('x2', i);
            line.setAttribute('y2', '100%');
            line.setAttribute('class', 'svg-time-line');
        svg.appendChild(line);
        let text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', i + 6);
            text.setAttribute('y', 0);
            text.setAttribute('class', 'svg-time-labels');
            if(i >= 2 * timeStep * timeLineInterval) {
                text.appendChild(document.createTextNode(
                    toDD(dataUnits[j][2].getDate()) + '.' +
                    toDD(dataUnits[j][2].getMonth() + 1) + ' ' +
                    toDD(dataUnits[j][2].getHours()) + ':' +
                    toDD(dataUnits[j][2].getMinutes())
                ));
            };
            j += timeLineInterval;
        svg.appendChild(text);
        if(j >= dataSize) {
            break;
        };
    };

    // temperature labels
    let c = 0;
    for(let i = svgHeight; i > 0; i -= tempValueMul * tempStep) {
        let line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', 0);
            line.setAttribute('y1', i);
            line.setAttribute('x2', '100%');
            line.setAttribute('y2', i);
            line.setAttribute('class', 'svg-temp-line');
        svg.appendChild(line);
        let text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', 0);
            text.setAttribute('y', i - 3);
            text.setAttribute('class', 'svg-temp-labels');
            if(c % 2 === 0) {
                text.appendChild(document.createTextNode(((svgHeight - i) / tempValueMul) + tempOffset + ' °C'));
            };
        svg.appendChild(text);
        c++;
    };

    let svgContainer = document.createElement('div');
        svgContainer.className = 'sct-temp-graph';
        svgContainer.style.width = svgWidth + 'px';
        svgContainer.style.height = svgHeight + 'px';
        svgContainer.append(svg);

    // TABLE

    dataUnits = dataUnits.filter((e, i, a) => {
        return e[1] != ((a[i - 1] !== undefined) && a[i - 1][1]);
    });

    let sctTempTable = document.createElement('table');
        sctTempTable.className = 'two-cols-table';
        sctTempTable.innerHTML = '<thead><tr><th>Index</th><th>Estimated time</th><th>Temperature &#176;C</th></tr></thead>';
    let sctTempTableBody = document.createElement('tbody');
        sctTempTable.append(sctTempTableBody);

    for(let [num, temp, date] of dataUnits) {
        if(temp === null) {
            continue;
        };

        sctTempTableBody.insertAdjacentHTML('beforeend',
            '<tr data-sct-table-warn="' +
            ((temp >= diskTempCritical) ? 'critical' : (temp >= diskTempWarning) ? 'warning' : '') +
            '"><td>' + num + '</td><td>' +
            date.getFullYear() + '-' +
            toDD(date.getMonth() + 1) + '-' +
            toDD(date.getDate()) + ' ' +
            toDD(date.getHours()) + ':' +
            toDD(date.getMinutes()) +
            '</td><td>' + temp + '</td></tr>'
        );

    };

    document.querySelector('.sct-temp-graph-container[data-sct-device="' + device + '"]').append(svgContainer);
    document.querySelector('.sct-temp-container[data-sct-device="' + device + '"]').append(sctTempTable);
}

function sctTempHandler() {
    SCT_DEVICES_ARRAY.forEach(e => {
        let [ device, dataSize, logInterval, deviceTime, diskTempWarning, diskTempCritical, tempData ] = e;
        createSctTemp(device, dataSize, logInterval, deviceTime, diskTempWarning, diskTempCritical, tempData);
    });
}


document.addEventListener("DOMContentLoaded", () => {
    initTabs();
    initPercentBars();
    sctTempHandler();
    if(USE_CGI_MODULE == 1) {
        showCgiPanel();
    };
    checkAlert();
    addTopScroll();
});

window.addEventListener('load', () => {
    initGraphs();
});
