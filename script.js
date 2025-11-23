document.getElementById("generateBtn").addEventListener("click", () => {
    const inputText = document.getElementById("inputJson").value;
    const outputDiv = document.getElementById("output");

    outputDiv.innerHTML = "";

    let jsonData;
    try {
        jsonData = JSON.parse(inputText);
    } catch (e) {
        outputDiv.innerHTML = "<p style='color:red;'>Invalid JSON</p>";
        return;
    }

    const cases = generateEdgeCases(jsonData);

    if (cases.length === 0) {
        outputDiv.innerHTML = "<p>No edge cases generated</p>";
        return;
    }

    cases.forEach((c) => {
        const block = document.createElement("pre");
        block.textContent = JSON.stringify(c, null, 2);
        outputDiv.appendChild(block);
    });
});

// ================= EDGE CASE GENERATOR =================
function generateEdgeCases(inputObj, maxCases = 50) {
    const cases = [];

    function addCase(modifiedObj) {
        if (cases.length < maxCases) {
            cases.push(structuredClone(modifiedObj));
        }
    }

    function generate(obj, path = []) {
        if (cases.length >= maxCases) return;

        if (Array.isArray(obj)) {
            return;
        }
        for (const key in obj) {
            const value = obj[key];
            const fullPath = [...path, key];

            const modifications = createModificationsBasedOnType(value);

            modifications.forEach(modifiedValue => {
                const temp = structuredClone(inputObj);
                setAtPath(temp, fullPath, modifiedValue);
                addCase(temp);
            });

            // Remove key
            const tempDelete = structuredClone(inputObj);
            deleteAtPath(tempDelete, fullPath);
            addCase(tempDelete);

            // Recurse for nested objects and arrays
            if (value !== null && typeof value === "object") {
                generate(value, fullPath);
            }
        }
    }

    generate(inputObj);
    return cases;
}

function createModificationsBasedOnType(value) {
    const mods = []; // null and empty string apply to all types

    mods.push(null);

    if (typeof value === "string") {
        mods.push("<script>alert(1)</script>");
        mods.push("' OR 1=1 --");
    }

    if (typeof value === "number") {
        mods.push(0, 999999999999, -999999999999);
    }

    if (Array.isArray(value)) {
        mods.push([]);
        return mods;
    }

    if (value !== null && typeof value === "object") {
        mods.push({});
    }

    return mods;
}

function setAtPath(obj, path, value) {
    let temp = obj;
    for (let i = 0; i < path.length - 1; i++) temp = temp[path[i]];
    temp[path[path.length - 1]] = value;
}

function deleteAtPath(obj, path) {
    let temp = obj;
    for (let i = 0; i < path.length - 1; i++) temp = temp[path[i]];
    delete temp[path[path.length - 1]];
}
