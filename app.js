$ = sel => document.querySelector(sel)

const chaptersEl = $(".chapters")
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
    const linkEls = $$x("LinkList")[1].children
    linkEls.__proto__.forEach = Array.prototype.forEach
    let chaptersHTML = ""
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

            chaptersHTML += `
                <li class="chapter">
                    <p class="chapter-name">${name}</p>
                    <p class="chapter-position">${positionSecs}</p>
                </li>
            `
        }
        catch (e) {
            console.error(e)
        }
        // findByAttr("ProgramChain ProgramList Item Program","ID")
    })
    chaptersEl.innerHTML = chaptersHTML
}


fileEl.onchange = e => {
    reader.readAsText(e.target.files[0])
}


// for each  link
    // targetid -> programchain
    // programchain.ProgramList.Item.Program.StartID -> AnchorList Item.ID
    // get that one's position