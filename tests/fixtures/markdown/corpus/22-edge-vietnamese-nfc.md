# Vietnamese NFC — Normalization Form Composed

## Baseline file

This file stores Vietnamese diacritics in **NFC form**:
each accented character is a single Unicode code point.

## Sample words

ế ộ ữ ẫ ỡ ậ ằ ắ ẳ ẵ ặ ầ ấ ẩ

Việt Nam
nghiêng thương
trường thịnh
quyền chuyện

## Sentences

Trường đại học Bách Khoa Hà Nội là trường đại học hàng đầu
của Việt Nam.

Nguyễn Du là đại thi hào dân tộc, tác giả Truyện Kiều.

## Technical note

- `ế` = U+1EBF (one code point)
- `ộ` = U+1ED9 (one code point)
- `ữ` = U+1EEF (one code point)

Each of the above is a single code point in NFC form.

## Comparison hint

This file should be byte-identical to `23-edge-vietnamese-nfd.md`
in terms of **visible characters**, but **different in bytes**.

## End

Kết thúc file NFC. Nghiêng thương thuyền nguyễn.