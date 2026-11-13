import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import { Icon, type IconName } from '../../components/Icon';
import { colors, radii } from '../../theme';

const icons: Record<string, IconName> = {
  index: 'home',
  telemetry: 'activity',
  instrument: 'dashboard',
  manage: 'manage',
};

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.mint,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarLabelStyle: styles.label,
        tabBarItemStyle: styles.item,
        tabBarStyle: styles.tabBar,
        tabBarIcon: ({ color, focused }) => (
          <Icon
            name={icons[route.name] ?? 'home'}
            size={22}
            color={String(color)}
            strokeWidth={focused ? 2.2 : 1.8}
          />
        ),
      })}
    >
      <Tabs.Screen name="index" options={{ title: '概览' }} />
      <Tabs.Screen name="telemetry" options={{ title: '车况' }} />
      <Tabs.Screen name="instrument" options={{ title: '仪表' }} />
      <Tabs.Screen name="manage" options={{ title: '管理' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    height: 72,
    left: 16,
    right: 16,
    bottom: 16,
    paddingTop: 8,
    paddingBottom: 9,
    backgroundColor: 'rgba(15,18,21,0.97)',
    borderTopWidth: 1,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.large,
    elevation: 14,
    shadowColor: '#000',
    shadowOpacity: 0.42,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
  },
  item: {
    borderRadius: 16,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2,
    marginTop: 3,
  },
});
