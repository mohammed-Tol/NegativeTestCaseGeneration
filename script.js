// State management
let testingStatus = {
    completedKeys: new Set(),
    testedCases: new Map()
};
let currentGeneratedCases = [];
let currentSelectedKey = '';

// Dark Mode Toggle
function initDarkMode() {
    const toggle = document.getElementById('darkModeToggle');
    if (!toggle) return;
    
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        toggle.textContent = '☀️';
    }
    
    toggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        toggle.textContent = isDark ? '☀️' : '🌙';
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
}

// Load saved data
function loadSavedData() {
    const savedJson = localStorage.getItem('edgeCaseInputJson');
    const savedTestingStatus = localStorage.getItem('testingStatus');
    
    if (savedTestingStatus) {
        const parsed = JSON.parse(savedTestingStatus);
        testingStatus.completedKeys = new Set(parsed.completedKeys || []);
        testingStatus.testedCases = new Map(
            (parsed.testedCases || []).map(([key, values]) => [key, new Set(values)])
        );
    }
    
    if (savedJson) {
        document.getElementById("inputJson").value = savedJson;
        document.getElementById("inputJson").dispatchEvent(new Event('input'));
    }
    
    initDarkMode();
}

// Save data to localStorage
function saveData() {
    const inputJson = document.getElementById("inputJson").value;
    localStorage.setItem('edgeCaseInputJson', inputJson);
    
    const statusToSave = {
        completedKeys: Array.from(testingStatus.completedKeys),
        testedCases: Array.from(testingStatus.testedCases.entries()).map(
            ([key, set]) => [key, Array.from(set)]
        )
    };
    localStorage.setItem('testingStatus', JSON.stringify(statusToSave));
}

// AUTO POPULATE KEYS WHEN USER TYPES JSON
document.getElementById("inputJson").addEventListener("input", () => {
    const raw = document.getElementById("inputJson").value;
    const selector = document.getElementById("keySelector");

    selector.innerHTML = "<option value=''>-- Select a Key --</option>";
    saveData();

    try {
        const json = JSON.parse(raw);
        const keys = extractKeys(json);

        keys.forEach(key => {
            const opt = document.createElement("option");
            opt.value = key;
            if (testingStatus.completedKeys.has(key)) {
                opt.classList.add("completed");
                opt.textContent = `✅ ${key}`;
            } else {
                opt.textContent = key;
            }
            selector.appendChild(opt);
        });
    } catch (e) {
        // Ignore if JSON invalid
    }
});

// Update selector styling when selection changes
document.getElementById("keySelector").addEventListener("change", () => {
    // Placeholder for future functionality
});

// PRETTIFY BUTTON
const prettifyBtn = document.getElementById("prettifyBtn");
if (prettifyBtn) {
    prettifyBtn.addEventListener("click", () => {
        const inputElement = document.getElementById("inputJson");
        const raw = inputElement.value.trim();
        
        if (!raw) {
            alert("Please enter some JSON first!");
            return;
        }
        
        try {
            const json = JSON.parse(raw);
            inputElement.value = JSON.stringify(json, null, 2);
            
            prettifyBtn.textContent = "✅ Prettified!";
            prettifyBtn.style.background = "#28a745";
            setTimeout(() => {
                prettifyBtn.textContent = "🎨 Prettify";
                prettifyBtn.style.background = "#4CAF50";
            }, 1500);
        } catch (e) {
            alert("Cannot prettify invalid JSON!");
        }
    });
}

// GENERATE BUTTON
document.getElementById("generateBtn").addEventListener("click", () => {
    const raw = document.getElementById("inputJson").value;
    const outputLeft = document.querySelector("#output-left .output-content") || document.getElementById("output");
    const outputRight = document.querySelector("#output-right .output-content");
    const selectedKey = document.getElementById("keySelector").value;
    const completeBtn = document.getElementById("completeTestingBtn");
    const exportJsonBtn = document.getElementById("exportJsonBtn");
    const exportCsvBtn = document.getElementById("exportCsvBtn");

    if (outputLeft) outputLeft.innerHTML = "";
    if (outputRight) outputRight.innerHTML = "";

    let json;
    try {
        json = JSON.parse(raw);
    } catch {
        if (outputLeft) outputLeft.innerHTML = "<p style='color:red;'>Invalid JSON</p>";
        if (completeBtn) completeBtn.style.display = "none";
        if (exportJsonBtn) exportJsonBtn.style.display = "none";
        if (exportCsvBtn) exportCsvBtn.style.display = "none";
        return;
    }

    if (!selectedKey) {
        if (outputLeft) outputLeft.innerHTML = "<p style='color:red;'>Please select a key.</p>";
        if (completeBtn) completeBtn.style.display = "none";
        if (exportJsonBtn) exportJsonBtn.style.display = "none";
        if (exportCsvBtn) exportCsvBtn.style.display = "none";
        return;
    }

    const cases = generateEdgeCases(json, selectedKey);
    currentGeneratedCases = cases;
    currentSelectedKey = selectedKey;

    // Show buttons
    if (completeBtn) {
        completeBtn.style.display = "inline-block";
        completeBtn.onclick = () => completeKeyTesting(selectedKey);
    }
    if (exportJsonBtn) exportJsonBtn.style.display = "inline-block";
    if (exportCsvBtn) exportCsvBtn.style.display = "inline-block";

    if (!testingStatus.testedCases.has(selectedKey)) {
        testingStatus.testedCases.set(selectedKey, new Set());
    }

    cases.forEach((c, index) => {
        const wrapper = document.createElement("div");
        wrapper.classList.add("copy-container");
        
        const isAlreadyTested = testingStatus.testedCases.get(selectedKey)?.has(index);
        if (isAlreadyTested) wrapper.classList.add("tested");

        const pre = document.createElement("pre");
        pre.textContent = JSON.stringify(c, null, 2);

        const copyBtn = document.createElement("button");
        copyBtn.textContent = "Copy";
        copyBtn.classList.add("copy-btn-inside");
        copyBtn.addEventListener("click", () => {
            navigator.clipboard.writeText(pre.textContent).then(() => {
                copyBtn.textContent = "Copied!";
                setTimeout(() => copyBtn.textContent = "Copy", 1500);
            });
        });

        const testBtn = document.createElement("button");
        testBtn.textContent = isAlreadyTested ? "Tested" : "Test";
        testBtn.classList.add("test-btn-inside");
        if (isAlreadyTested) testBtn.classList.add("tested");

        testBtn.addEventListener("click", () => {
            const testedCases = testingStatus.testedCases.get(selectedKey);
            if (testedCases.has(index)) {
                testedCases.delete(index);
                testBtn.textContent = "Test";
                testBtn.classList.remove("tested");
                wrapper.classList.remove("tested");
            } else {
                testedCases.add(index);
                testBtn.textContent = "Tested";
                testBtn.classList.add("tested");
                wrapper.classList.add("tested");
            }
            saveData();
        });

        wrapper.appendChild(pre);
        wrapper.appendChild(copyBtn);
        wrapper.appendChild(testBtn);

        // Two-column layout
        if (outputRight) {
            if (index % 2 === 0) {
                outputLeft.appendChild(wrapper);
            } else {
                outputRight.appendChild(wrapper);
            }
        } else {
            outputLeft.appendChild(wrapper);
        }
    });
});

// Complete Key Testing
function completeKeyTesting(keyPath) {
    testingStatus.completedKeys.add(keyPath);
    
    const selector = document.getElementById("keySelector");
    const options = selector.querySelectorAll("option");
    options.forEach(option => {
        if (option.value === keyPath) {
            option.classList.add("completed");
            option.textContent = `✅ ${keyPath}`;
        }
    });
    
    saveData();
    alert(`Testing completed for key: ${keyPath}`);
}

function extractKeys(obj, prefix = "") {
    let keys = [];

    for (let k in obj) {
        const full = prefix ? `${prefix}.${k}` : k;
        keys.push(full);

        const val = obj[k];
        // If it's an array, only consider the first element for key extraction
        if (Array.isArray(val)) {
            if (val.length > 0 && typeof val[0] === 'object' && val[0] !== null) {
                keys = keys.concat(extractKeys(val[0], full));
            }
        } else if (typeof val === "object" && val !== null) {
            keys = keys.concat(extractKeys(val, full));
        }
    }
    return keys;
}

function generateEdgeCases(json, keyPath) {
    const cases = [];
    const pathParts = keyPath.split(".");
    const value = getAtPath(json, pathParts);

    const mods = createModifications(value);

    mods.forEach(mod => {
        const copy = structuredClone(json);
        setAtPath(copy, pathParts, mod);
        cases.push(copy);
    });

    const deleted = structuredClone(json);
    deleteAtPath(deleted, pathParts);
    cases.push(deleted);

    return cases;
}

function createModifications(val) {
    let m = [null];

    // STRING - comprehensive edge cases
    if (typeof val === "string") {
        m.push("");                                    // Empty string
        m.push("Test\nNew\tLine");                     // Special characters
        m.push("™©®€¥£");                             // Unicode symbols
        m.push("مرحبا 你好 🎉");                        // Unicode/Emoji
        return m;
    }

    // NUMBER - boundary and type edge cases
    if (typeof val === "number") {
        m.push(0);
        m.push(-1);
        m.push(Number.MAX_SAFE_INTEGER);
        return m;
    }

    // BOOLEAN
    if (typeof val === "boolean") {
        m.push("true");                                // String instead
        m.push(0);                                     // Number instead
        m.push("");                                    // Empty string
        return m;
    }

    // ARRAY
    if (Array.isArray(val)) {
        m.push([]);                                    // Empty array
        m.push([null]);                                // Array with null
        m.push([""]);                                  // Array with empty string
        m.push("not-an-array");                        // Type mismatch
        return m;
    }

    // OBJECT
    if (typeof val === "object" && val !== null) {
        m.push({});                                    // Empty object
        return m;
    }

    return m;
}

function getAtPath(obj, path) {
    return path.reduce((o, p) => {
        if (o === undefined || o === null) return undefined;
        // If current value is an array and we're still resolving properties,
        // use the first element as the representative for nested properties.
        if (Array.isArray(o)) {
            // If the path segment refers to the array itself (i.e., last segment), return the array
            // The reduce will continue only if there are more segments; but here we always need
            // to access the next property on the first element.
            o = o[0];
            if (o === undefined || o === null) return undefined;
        }
        return o[p];
    }, obj);
}

function setAtPath(obj, path, value) {
    let o = obj;
    for (let i = 0; i < path.length - 1; i++) {
        const p = path[i];
        if (o == null) return;
        let next = o[p];
        if (Array.isArray(next)) {
            // Ensure there is a first element to descend into
            if (next.length === 0) next.push({});
            o = next[0];
        } else {
            o = next;
        }
    }
    const last = path[path.length - 1];
    if (Array.isArray(o)) {
        // If parent is an array, set the property on the first element
        if (o.length === 0) o.push({});
        o[0][last] = value;
    } else {
        o[last] = value;
    }
}

function deleteAtPath(obj, path) {
    let o = obj;
    for (let i = 0; i < path.length - 1; i++) {
        const p = path[i];
        if (o == null) return;
        const next = o[p];
        if (Array.isArray(next)) {
            o = next[0];
        } else {
            o = next;
        }
    }
    const last = path[path.length - 1];
    if (Array.isArray(o)) {
        if (o.length > 0) delete o[0][last];
    } else if (o) {
        delete o[last];
    }
}

// Export to JSON
const exportJsonBtn = document.getElementById("exportJsonBtn");
if (exportJsonBtn) {
    exportJsonBtn.addEventListener("click", () => {
        if (currentGeneratedCases.length === 0) {
            alert("No test cases to export!");
            return;
        }
        
        const exportData = {
            key: currentSelectedKey,
            generatedAt: new Date().toISOString(),
            totalCases: currentGeneratedCases.length,
            testCases: currentGeneratedCases
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `edge-cases-${currentSelectedKey.replace(/\./g, '-')}-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
}

// Export to CSV
const exportCsvBtn = document.getElementById("exportCsvBtn");
if (exportCsvBtn) {
    exportCsvBtn.addEventListener("click", () => {
        if (currentGeneratedCases.length === 0) {
            alert("No test cases to export!");
            return;
        }
        
        let csv = 'Test Case #,Key Modified,JSON Payload\n';
        currentGeneratedCases.forEach((testCase, index) => {
            const jsonStr = JSON.stringify(testCase).replace(/"/g, '""');
            csv += `${index + 1},"${currentSelectedKey}","${jsonStr}"\n`;
        });
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `edge-cases-${currentSelectedKey.replace(/\./g, '-')}-${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", loadSavedData);
