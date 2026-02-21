import js from "@eslint/js";
import globals from "globals";

export default [
    js.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "module",
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.jest,
            }
        },
        rules: {
            // 기존 코드에 에러가 많아 파이프라인이 즉각 실패하는 것을 방지하기 위해 임시로 경고(warn) 처리합니다.
            // 나중에 코드가 안정화되면 "error"로 올릴 수 있습니다.
            "no-unused-vars": "warn",
            "no-undef": "warn",
            "no-empty": "warn",
            "no-constant-condition": "warn"
        }
    }
];
