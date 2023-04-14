pub fn string_to_u16_slice<const N: usize>(s: &str) -> [u16; N] {
    let utf16_iter = s.encode_utf16();
    let mut array: [u16; N] = [0; N];
    for (i, c) in utf16_iter.enumerate() {
        if i >= N {
            break;
        }
        array[i] = c;
    }
    array
}

#[test]
fn test_string_to_u16_slice() {
    let s = "Hello, world!";
    let expected = [
        72, 101, 108, 108, 111, 44, 32, 119, 111, 114, 108, 100, 33, 0,
    ];
    let result = string_to_u16_slice(s);
    assert_eq!(result, expected);
}
