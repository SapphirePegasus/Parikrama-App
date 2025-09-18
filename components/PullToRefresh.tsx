// components/RefreshWrapper.tsx
import React, { useCallback, useState } from "react";
import { RefreshControl, ScrollView, ViewStyle } from "react-native";

type Props = {
  onRefresh: () => Promise<void> | void;
  children: React.ReactNode;
  style?: ViewStyle;
  scrollEnabled?: boolean;
};

export default function RefreshWrapper({
  onRefresh,
  children,
  style,
  scrollEnabled = true,
}: Props) {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  }, [onRefresh]);

  return (
    <ScrollView
      style={style}
      scrollEnabled={scrollEnabled}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {children}
    </ScrollView>
  );
}
