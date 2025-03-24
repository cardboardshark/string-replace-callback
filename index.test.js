import { stringReplaceCallback } from "./dist/index.js";
import test from "ava";

test("String needle", (t) => {
    t.deepEqual(
        stringReplaceCallback("My vanilla string", "vanilla", () => "magic"),
        ["My ", "magic", " string"]
    );
});

test("Regexp needle", (t) => {
    t.deepEqual(
        stringReplaceCallback(
            "My vanilla string",
            new RegExp(/(vanilla)/gm),
            () => "magic"
        ),
        ["My ", "magic", " string"]
    );
});

test("Both string and Regexp needles in a map", (t) => {
    const map = new Map();
    map.set("vanilla", () => "magic");
    map.set(/(string)/gim, (match) => ({
        MagicalComponent: ["react", "jsx", "svelte", "htmx", "etc", match],
    }));

    const result = stringReplaceCallback("My vanilla string", map);
    const expectedResult = [
        "My ",
        "magic",
        " ",
        {
            MagicalComponent: [
                "react",
                "jsx",
                "svelte",
                "htmx",
                "etc",
                "string",
            ],
        },
    ];

    t.deepEqual(result, expectedResult);
});

test("Handles multiple capture groups in same needle", (t) => {
    const haystack = `apple orange shark`;
    const needle = /(apple)|(orange)/;
    const result = stringReplaceCallback(haystack, needle, (match) => {
        return `<b>${match}</b>`;
    });

    const expectedResult = ["<b>apple</b>", " ", "<b>orange</b>", " shark"];
    t.deepEqual(result, expectedResult);
});

test("Can be run multiple times on same haystack", (t) => {
    const haystack = `crab sturgeon shark`;
    const needle = /(crab)|(shark)/;
    const firstPassResult = stringReplaceCallback(haystack, needle, (match) => {
        return `<b>${match}</b>`;
    });
    const expectedFirstResult = ["<b>crab</b>", " sturgeon ", "<b>shark</b>"];
    t.deepEqual(firstPassResult, expectedFirstResult);

    const secondNeedle = "sturgeon";
    const secondResult = stringReplaceCallback(
        firstPassResult,
        secondNeedle,
        (match, meta) => ({
            type: "fish",
            id: "sturgeon",
            match: match,
            key: meta.key,
        })
    );

    const expectedSecondResult = [
        "<b>crab</b>",
        " ",
        {
            type: "fish",
            id: "sturgeon",
            match: "sturgeon",
            key: "0-0",
        },
        " ",
        "<b>shark</b>",
    ];
    t.deepEqual(secondResult, expectedSecondResult);
});

test("Empty input returns empty output", (t) => {
    t.deepEqual(
        stringReplaceCallback("", "setup_to_fail", () => "magic"),
        []
    );

    t.deepEqual(
        stringReplaceCallback([], "setup_to_fail", () => "magic"),
        []
    );
});

test("Unprocessable haystack elements are returned unchanged", (t) => {
    const result = stringReplaceCallback(
        ["abc", NaN, 123, ["nested array"], { object: "uhoh" }],
        "setup_to_fail",
        () => "magic"
    );
    t.deepEqual(result, ["abc", NaN, 123, "nested array", { object: "uhoh" }]);
});
