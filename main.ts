import { unzip } from "unzipit";
import Encoding from "encoding-japanese";

let form = new FormData();
form.append("mode", "download");
form.append("format", "dicall");
form.append("dgroup", "jt");
form.append("dtype1", "msime");
form.append("dtype2", "kana");
form.append("dlang", "j2");

const res = await fetch("https://whisper.wisdom-guild.net/apps/autodic/", {
    method: "POST",
    body: form 
});

console.log(res)

if (res.body) {
    const filename: string = res.url.split("/").at(-1);

    const buf = await res.arrayBuffer();
    const {entries} = await unzip(buf);
    const entryBuffer = new Uint8Array(await entries[filename].arrayBuffer());

    const unicodeText = Encoding.convert(entryBuffer, {
        to: "UNICODE",
        from: "SJIS",
        type: "string",
    });
    console.log(unicodeText);

    const text = unicodeText.split("\n")
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => {
            line = line.slice(1);

            const [kana, name, _] = line.split("\t")
            return `${kana} /${name}/`;
        })
        .join("\n");

    const header = `;; -*- coding: utf-8 -*-
;; Wisdom Guild MTG Dictionary for SKK
;; ref: https://whisper.wisdom-guild.net/apps/autodic/
;;
;; MIT License
;;
;; Copyright 2025 yanknvim
;; Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
;;
;; The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
;;
;; THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
;;
;; okuri-ari entries.
;; okuri-nasi entries.
`;    

    await Deno.writeTextFile("SKK-MTG-JISYO.utf8", header + text);
}
