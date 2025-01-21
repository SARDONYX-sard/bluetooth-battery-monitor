/// Convert address(`de:ad:be:ee:ee:ef`) of string (e.g., `Bluetooth#Bluetooth00:00:00:ff:ff:00-de:ad:be:ee:ee:ef`) into a [u64].
pub fn id_to_address(id: &mut &str) -> winnow::PResult<u64> {
    use winnow::prelude::Parser as _;

    let input = id;
    let prefix = "Bluetooth#Bluetooth";
    let _ = (prefix, hex_address, '-').parse_next(input)?;

    // Convert address string (e.g., "00:00:00:ff:ff:00") into a u64.
    let address = hex_address.parse_next(input)?;
    let combined = ((address.0 as u64) << 40)
        | ((address.1 as u64) << 32)
        | ((address.2 as u64) << 24)
        | ((address.3 as u64) << 16)
        | ((address.4 as u64) << 8)
        | (address.5 as u64);
    Ok(combined)
}

fn hex_primary(input: &mut &str) -> winnow::PResult<u8> {
    use winnow::token::take_while;
    use winnow::Parser;

    take_while(2, |c: char| c.is_ascii_hexdigit())
        .try_map(|input| u8::from_str_radix(input, 16))
        .parse_next(input)
}

/// Parse hex address e.g. `de:ad:be:ee:ee:ef`
fn hex_address(input: &mut &str) -> winnow::PResult<(u8, u8, u8, u8, u8, u8)> {
    use winnow::seq;
    use winnow::Parser as _;

    seq! {
        hex_primary,
        _: ':',
        hex_primary,
        _: ':',
        hex_primary,
        _: ':',

        hex_primary,
        _: ':',
        hex_primary,
        _: ':',
        hex_primary,
    }
    .parse_next(input)
}

#[cfg(test)]
mod tests {
    use super::*;
    use winnow::Parser as _;

    #[test]
    fn test_id_to_address() {
        let id = "Bluetooth#Bluetooth00:00:00:ff:ff:00-de:ad:be:ee:ee:ef";
        let address = id_to_address
            .parse(id)
            .unwrap_or_else(|err| panic!("{err}"));
        assert_eq!(address, 0xdeadbeeeeeef);
    }
}
