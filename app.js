$ = sel => document.querySelector(sel)

const chaptersTable = $(".chapters-table")
const fileEl = $("#file-upload")
const parser = new DOMParser();
const reader = new FileReader()
reader.onload = readEvt => {
    parseXMLText(readEvt.target.result)
}

const getLinkName = linkEl => {
    if (linkEl.getAttribute("LinkName")) {
        return linkEl.getAttribute("LinkName")
    }
    else {
        const nameEl = linkEl.querySelector("LinkName")
        return nameEl.textContent.trim()
    }
}

const parseXMLText = text => {
    xmlDoc = parser.parseFromString(text, "text/xml")
    $x = sel => xmlDoc.querySelector(sel)
    $$x = sel => xmlDoc.querySelectorAll(sel)
    const findByAttr = (sel, attr, val) => {
        return $x(`${sel}[${attr}="${val}"]`)
    }
    const linkLists = $$x("LinkList")
    let chaptersHTML = ""
    for (let i = 1; i < linkLists.length; i ++) {
        // skip the first one because it's an irrelevant menu
        chaptersHTML += `
            <h3 class="table-title" >
                Chapter Group ${i}
            </h3>
            <li class="chapter heading">
                <p class="chapter-name">Title</p>
                <p class="chapter-position">Position (HH:MM:SS)</p>
            </li>
            <ul class="chapters">
        `

        const linkEls = linkLists[i].children
        linkEls.__proto__.forEach = Array.prototype.forEach
        linkEls.forEach(linkEl => {
            try {
                const name = getLinkName(linkEl)
                const targetID = linkEl.getAttribute("LinkTargetUID")
                const programChain = findByAttr("ProgramChain","ID", targetID)
                const startID = programChain.querySelector("ProgramList Item Program").getAttribute("StartID")            
                const position = findByAttr("AnchorList Item", "ID", startID).getAttribute("Position")
                const regExp = /\(([^)]+)\)/
                const matches = regExp.exec(position);
                const positionSecs = matches[1]
                const hours = Math.floor(positionSecs / 3600)
                const minutes = Math.floor((positionSecs % ( hours * 3600 ) ) || positionSecs / 60)
                const seconds = (positionSecs % (minutes * 60) || positionSecs)
                chaptersHTML += `
                    <li class="chapter">
                        <p class="chapter-name">${name}</p>
                        <p class="chapter-position">${hours}:${minutes}:${parseInt(seconds)}</p>
                    </li>
                `
            }
            catch (e) {
                console.error(e)
            }
        })
        chaptersHTML += '</ul>'
    }
    chaptersTable.innerHTML = chaptersHTML
}


fileEl.onchange = e => {
    reader.readAsText(e.target.files[0])
}


// for each  link
    // targetid -> programchain
    // programchain.ProgramList.Item.Program.StartID -> AnchorList Item.ID
    // get that one's position