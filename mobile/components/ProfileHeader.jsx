import { Text, View } from "react-native";
import { useAuthStore } from "../store/authStore";
import styles from "../assets/styles/profile.styles";
import { Image } from "expo-image";
import { formatMemberSince } from "../lib/utils";

export default function ProfileHeader() {
  const { user } = useAuthStore();

  if (!user) return null;

  return (
    <View style={styles.profileHeader}>
      <Image source={{ uri: user?.profileImage }} style={styles.profileImage} />

      <View style={styles.profileInfo}>
        <View style={styles.username}>{user?.username}</View>
        <View style={styles.email}>{user?.email}</View>

        <Text style={styles.memberSince}>
          {" "}
          Joined {formatMemberSince(user?.createdAt)}
        </Text>
      </View>
    </View>
  );
}
