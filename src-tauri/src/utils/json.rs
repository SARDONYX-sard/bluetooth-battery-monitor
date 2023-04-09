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
