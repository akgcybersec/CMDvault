(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/lib/storage.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Storage layer backed by SQLite via Next.js API routes.
__turbopack_context__.s([
    "addCommand",
    ()=>addCommand,
    "addCommandStep",
    ()=>addCommandStep,
    "addNote",
    ()=>addNote,
    "addPlaceholder",
    ()=>addPlaceholder,
    "addPlaceholderSet",
    ()=>addPlaceholderSet,
    "addPlaceholderValue",
    ()=>addPlaceholderValue,
    "addTag",
    ()=>addTag,
    "clearSession",
    ()=>clearSession,
    "deleteCommand",
    ()=>deleteCommand,
    "deleteCommandStep",
    ()=>deleteCommandStep,
    "deleteNote",
    ()=>deleteNote,
    "deletePlaceholder",
    ()=>deletePlaceholder,
    "deletePlaceholderSet",
    ()=>deletePlaceholderSet,
    "deletePlaceholderValue",
    ()=>deletePlaceholderValue,
    "deleteTag",
    ()=>deleteTag,
    "getCommandSteps",
    ()=>getCommandSteps,
    "getCommands",
    ()=>getCommands,
    "getNotes",
    ()=>getNotes,
    "getPlaceholderSets",
    ()=>getPlaceholderSets,
    "getPlaceholderValues",
    ()=>getPlaceholderValues,
    "getPlaceholders",
    ()=>getPlaceholders,
    "getSession",
    ()=>getSession,
    "getTags",
    ()=>getTags,
    "initializeStorage",
    ()=>initializeStorage,
    "setSession",
    ()=>setSession,
    "updateCommand",
    ()=>updateCommand,
    "updateCommandStep",
    ()=>updateCommandStep,
    "updateCommandSteps",
    ()=>updateCommandSteps,
    "updateCommandTags",
    ()=>updateCommandTags,
    "updateNote",
    ()=>updateNote,
    "updateNoteTags",
    ()=>updateNoteTags,
    "updatePlaceholder",
    ()=>updatePlaceholder,
    "updatePlaceholderSet",
    ()=>updatePlaceholderSet,
    "updatePlaceholderValue",
    ()=>updatePlaceholderValue,
    "updateTag",
    ()=>updateTag,
    "verifyUser",
    ()=>verifyUser
]);
const STORAGE_KEYS = {
    SESSION: "pentester_session"
};
function initializeStorage() {
    return;
}
// Helpers for API calls
async function api(input, init) {
    const res = await fetch(input, init);
    if (!res.ok) {
        throw new Error(`API error ${res.status}`);
    }
    return await res.json();
}
async function getCommands() {
    return api("/api/commands");
}
async function addCommand(command) {
    return api("/api/commands", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(command)
    });
}
async function updateCommand(id, updates) {
    await api(`/api/commands/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(updates)
    });
}
async function deleteCommand(id) {
    await api(`/api/commands/${id}`, {
        method: "DELETE"
    });
}
async function getTags() {
    return api("/api/tags");
}
async function addTag(tag) {
    return api("/api/tags", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(tag)
    });
}
async function updateTag(id, updates) {
    await api(`/api/tags/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(updates)
    });
}
async function deleteTag(id) {
    await api(`/api/tags/${id}`, {
        method: "DELETE"
    });
}
async function updateCommandTags(commandId, tagIds) {
    await api(`/api/commands/${commandId}/tags`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            tagIds
        })
    });
}
async function getPlaceholders() {
    return api("/api/placeholders");
}
async function addPlaceholder(name) {
    return api("/api/placeholders", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name
        })
    });
}
async function updatePlaceholder(id, updates) {
    await api(`/api/placeholders/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(updates)
    });
}
async function deletePlaceholder(id) {
    await api(`/api/placeholders/${id}`, {
        method: "DELETE"
    });
}
async function getPlaceholderSets() {
    return api("/api/placeholder-sets");
}
async function addPlaceholderSet(name) {
    return api("/api/placeholder-sets", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name
        })
    });
}
async function updatePlaceholderSet(id, updates) {
    await api(`/api/placeholder-sets/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(updates)
    });
}
async function deletePlaceholderSet(id) {
    await api(`/api/placeholder-sets/${id}`, {
        method: "DELETE"
    });
}
async function getPlaceholderValues(setId) {
    return api(`/api/placeholder-values?set_id=${setId}`);
}
async function addPlaceholderValue(setId, placeholderName, defaultValue) {
    return api("/api/placeholder-values", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            set_id: setId,
            placeholder_name: placeholderName,
            default_value: defaultValue
        })
    });
}
async function updatePlaceholderValue(setId, placeholderName, defaultValue) {
    await api("/api/placeholder-values", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            set_id: setId,
            placeholder_name: placeholderName,
            default_value: defaultValue
        })
    });
}
async function deletePlaceholderValue(id) {
    await api(`/api/placeholder-values/${id}`, {
        method: "DELETE"
    });
}
async function getNotes() {
    return api("/api/notes");
}
async function addNote(title, content) {
    return api("/api/notes", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            title,
            content
        })
    });
}
async function updateNote(id, updates) {
    await api(`/api/notes/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(updates)
    });
}
async function deleteNote(id) {
    await api(`/api/notes/${id}`, {
        method: "DELETE"
    });
}
async function updateNoteTags(noteId, tagIds) {
    await api(`/api/notes/${noteId}/tags`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            tagIds
        })
    });
}
async function getCommandSteps(commandId) {
    return api(`/api/command-steps?command_id=${commandId}`);
}
async function addCommandStep(commandId, stepNumber, command, comment = '') {
    return api("/api/command-steps", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            command_id: commandId,
            step_number: stepNumber,
            command,
            comment
        })
    });
}
async function updateCommandStep(id, updates) {
    await api(`/api/command-steps/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(updates)
    });
}
async function deleteCommandStep(id) {
    await api(`/api/command-steps/${id}`, {
        method: "DELETE"
    });
}
async function updateCommandSteps(commandId, steps) {
    await api(`/api/command-steps/batch/${commandId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            steps
        })
    });
}
async function verifyUser(username, password) {
    try {
        const res = await fetch("/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username,
                password
            })
        });
        return res.ok;
    } catch  {
        return false;
    }
}
function setSession(isLoggedIn) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(isLoggedIn));
}
function getSession() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    const session = localStorage.getItem(STORAGE_KEYS.SESSION);
    return session ? JSON.parse(session) : false;
}
function clearSession() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    localStorage.removeItem(STORAGE_KEYS.SESSION);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Home
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/storage.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
function Home() {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Home.useEffect": ()=>{
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["initializeStorage"])();
            const session = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSession"])();
            if (session) {
                router.push("/vault");
            } else {
                router.push("/login");
            }
            setIsLoading(false);
        }
    }["Home.useEffect"], [
        router
    ]);
    if (isLoading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "min-h-screen bg-background flex items-center justify-center",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-foreground font-mono",
                children: "Loading..."
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 27,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/app/page.tsx",
            lineNumber: 26,
            columnNumber: 7
        }, this);
    }
    return null;
}
_s(Home, "l9mOnJ2XXArxG69ajpcNCw8SPqI=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = Home;
var _c;
__turbopack_context__.k.register(_c, "Home");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_73dbb121._.js.map