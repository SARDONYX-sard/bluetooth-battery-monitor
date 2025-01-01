import { useState } from 'react';

import { OBJECT } from '@/lib/object-utils';
import { type Cache, PUB_CACHE_KEYS } from '@/lib/storage';

export const useCheckBoxState = (cacheItems: Cache) => {
  const [isAllChecked, setIsAllChecked] = useState(false);
  const [isPubAllChecked, setIsPublicAllChecked] = useState(false);
  const [checked, setSelectedItems] = useState<readonly (keyof Cache)[]>([]);

  const handleToggleItem = (selectedKey: keyof Cache) => () => {
    setSelectedItems((prev) => {
      if (prev.includes(selectedKey)) {
        return prev.filter((key) => key !== selectedKey);
      }
      return [...prev, selectedKey];
    });
    setIsAllChecked(false);
    setIsPublicAllChecked(false);
  };

  const handleCheckAll = () => {
    setIsPublicAllChecked(false);
    setIsAllChecked((prev) => {
      const newIsAllChecked = !prev;
      setSelectedItems(newIsAllChecked ? OBJECT.keys(cacheItems) : []);
      return newIsAllChecked;
    });
  };

  const handleCheckPubAll = () => {
    setIsAllChecked(false);
    setIsPublicAllChecked((prev) => {
      const newIsPublicChecked = !prev;
      setSelectedItems(newIsPublicChecked ? PUB_CACHE_KEYS : []);
      return newIsPublicChecked;
    });
  };

  return {
    isAllChecked,
    isPubAllChecked,
    checked,
    handleToggleItem,
    handleCheckAll,
    handleCheckPubAll,
  };
};
