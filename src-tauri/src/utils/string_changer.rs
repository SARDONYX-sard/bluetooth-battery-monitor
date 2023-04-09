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
