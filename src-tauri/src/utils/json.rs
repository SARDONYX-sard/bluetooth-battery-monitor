use serde_json::Value;

pub fn merge_json_arrays_by_key(arr1: &[Value], arr2: &[Value], key: &str) -> Vec<Value> {
    let mut result = Vec::new();

    for val1 in arr1 {
        if let Some(bluetooth_address) = val1.get(key) {
            let merged_value = arr2
                .iter()
                .find(|val2| val2.get(key) == Some(bluetooth_address));
            if let Some(val2) = merged_value {
                let mut merged_val = val1.clone();
                merged_val
                    .as_object_mut()
                    .unwrap()
                    .extend(val2.as_object().unwrap().clone());
                result.push(merged_val);
            }
        }
    }

    result
}

#[cfg(test)]
mod tests {
    use super::merge_json_arrays_by_key;
    use serde_json::json;

    #[test]
    fn test_merge_json_arrays_by_key() {
        let arr1 = vec![
            json!({"id": 1, "name": "Alice", "age": 25, "bluetooth_address": "00:11:22:33:44:55"}),
            json!({"id": 2, "name": "Bob", "age": 30, "bluetooth_address": "66:77:88:99:aa:bb"}),
            json!({"id": 3, "name": "Charlie", "age": 35, "bluetooth_address": "dd:ee:ff:11:22:33"}),
        ];
        let arr2 = vec![
            json!({"bluetooth_address": "00:11:22:33:44:55", "last_seen": "2022-04-10T12:34:56Z"}),
            json!({"bluetooth_address": "66:77:88:99:aa:bb", "last_seen": "2022-04-09T23:45:01Z"}),
            json!({"bluetooth_address": "11:22:33:44:55:66", "last_seen": "2022-04-11T08:12:34Z"}),
        ];
        let expected_result = vec![
            json!({"id": 1, "name": "Alice", "age": 25, "bluetooth_address": "00:11:22:33:44:55", "last_seen": "2022-04-10T12:34:56Z"}),
            json!({"id": 2, "name": "Bob", "age": 30, "bluetooth_address": "66:77:88:99:aa:bb", "last_seen": "2022-04-09T23:45:01Z"}),
        ];

        let result = merge_json_arrays_by_key(&arr1, &arr2, "bluetooth_address");
        assert_eq!(result, expected_result);
    }
}
