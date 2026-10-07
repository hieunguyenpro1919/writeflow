# Vietnamese NFD — Normalization Form Decomposed

## Baseline file

This file stores Vietnamese diacritics in **NFD form**:
each accented character is decomposed into a base letter
plus combining marks.

## Sample words

ế ộ ữ ẫ ỡ ậ ằ ắ ẳ ẵ ặ ầ ấ ẩ

Việt Nam
nghiêng thương
trường thịnh
quyền chuyện

## Sentences

Trường đại học Bách Khoa Hà Nội là trường đại học hàng đầu
của Việt Nam.

Nguyễn Du là đại thi hào dân tộc, tác giả Truyện Kiều.

## Technical note

- `ế` = U+0065 U+0302 U+0301 (three code points)
- `ộ` = U+006F U+0302 U+0323 (three code points)
- `ữ` = U+0075 U+031B U+0303 (three code points)

Each of the above is a sequence of code points in NFD form.

## Comparison hint

This file should be byte-identical to `22-edge-vietnamese-nfc.md`
in terms of **visible characters**, but **different in bytes**.

## End

Kết thúc file NFD. Nghiêng thương thuyền nguyễn.