import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ROUTES } from "../../src/constants/routes";
import { COLORS, FONT } from "../../src/constants/theme";
import { useUser } from "../../src/context/UserContext";
import { LocationResult, useLocationSearch } from "../../src/hooks/useLocationSearch";
import { useNavigation } from "../../src/utils/navigation";

const { width } = Dimensions.get("window");

const JAIPUR_USERS = [
  {
    id: "1",
    name: "Priya Sharma",
    age: 26,
    location: "Jaipur, Rajasthan",
    photos: ["https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400"],
    occupation: "Software Engineer",
    distance: "2.5 km",
  },
  {
    id: "2",
    name: "Rahul Mehta",
    age: 28,
    location: "Jaipur, Rajasthan",
    photos: ["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400"],
    occupation: "Business Consultant",
    distance: "3.1 km",
  },
];

export default function NearMeScreen() {
  const nav = useNavigation();
  const { setViewedProfile, session, profile } = useUser();

  const [location, setLocation] = useState("Jaipur, Rajasthan");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState(JAIPUR_USERS);

  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const { results, loading: searchLoading, searchPlaces } = useLocationSearch();
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (profile?.name) {
      const me = {
        id: session?.user?.id || "me",
        name: profile.name,
        age: profile.age || 25,
        location: profile.location || "Jaipur",
        photos:
          profile.photos?.length > 0
            ? profile.photos
            : ["https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400"],
        occupation: profile.occupation || "Professional",
        distance: "0 km",
      };
      setUsers([me, ...JAIPUR_USERS]);
    }
  }, []);

  const handleUserPress = (user: any) => {
    setSelectedUser(user);
    setShowProfileModal(true);
  };

  const handleLocationSearch = () => {
    setLoading(true);
    setTimeout(() => {
      setUsers(JAIPUR_USERS);
      setLoading(false);
    }, 600);
  };

  const renderUserCard = ({ item }: any) => {
    const isOwnProfile = session?.user?.id === item.id || item.id === "me";

    return (
      <TouchableOpacity style={styles.card} onPress={() => handleUserPress(item)}>
        <Image source={{ uri: item.photos[0] }} style={styles.cardImage} />
        <View style={styles.cardOverlay} />
        {isOwnProfile && (
          <View style={styles.ownProfileBadge}>
            <Text style={styles.ownProfileText}>YOU</Text>
          </View>
        )}
        <View style={styles.cardContent}>
          <Text style={styles.cardName}>{item.name}, {item.age}</Text>
          <Text style={styles.cardOccupation}>{item.occupation}</Text>
          <View style={styles.distanceBadge}>
            <Text style={styles.distanceText}>{item.distance}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>Near Me</Text>
      </View>

      {/* LOCATION SEARCH */}
      <View style={styles.locationContainer}>
        <TextInput
          value={location}
          onChangeText={setLocation}
          style={styles.locationInput}
        />
        <TouchableOpacity style={styles.searchBtn} onPress={handleLocationSearch}>
          <MaterialCommunityIcons name="magnify" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* USER GRID */}
      {loading ? (
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
      ) : (
        <FlatList
          data={users}
          renderItem={renderUserCard}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          contentContainerStyle={{ padding: 20 }}
        />
      )}

      {/* PROFILE POPUP MODAL */}
      <Modal visible={showProfileModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.profileModalCard}>
            {selectedUser && (
              <>
                <Image source={{ uri: selectedUser.photos[0] }} style={styles.profileModalImage} />
                <Text style={styles.profileModalName}>
                  {selectedUser.name}, {selectedUser.age}
                </Text>
                <Text style={styles.profileModalJob}>{selectedUser.occupation}</Text>

                <View style={styles.profileModalActions}>
                  <TouchableOpacity
                    style={styles.modalLikeBtn}
                    onPress={() => Alert.alert("You liked this profile ❤️")}
                  >
                    <MaterialCommunityIcons name="heart" size={22} color="#fff" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.modalViewBtn}
                    onPress={() => {
                      setShowProfileModal(false);
                      setViewedProfile(selectedUser);
                      nav.navigate(ROUTES.PROFILE_DETAIL);
                    }}
                  >
                    <Text style={styles.modalViewText}>View Profile</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={() => setShowProfileModal(false)}>
                  <Text style={styles.modalCloseText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAFAFA", paddingTop: 60 },
  header: { paddingHorizontal: 20, marginBottom: 20 },
  title: { fontSize: 28, fontFamily: FONT.UI_BOLD, color: COLORS.TEXT },

  locationContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 10,
    marginBottom: 10,
  },
  locationInput: { flex: 1 },
  searchBtn: {
    backgroundColor: COLORS.PRIMARY,
    padding: 10,
    borderRadius: 12,
  },

  card: {
    width: (width - 60) / 2,
    height: 290,
    borderRadius: 24,
    marginBottom: 20,
    overflow: "hidden",
    backgroundColor: "#000",
  },
  cardImage: { width: "100%", height: "100%" },
  cardOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.3)" },

  cardContent: {
    position: "absolute",
    bottom: 0,
    padding: 14,
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  cardName: { fontSize: 18, color: "#fff", fontFamily: FONT.UI_BOLD },
  cardOccupation: { fontSize: 13, color: "#ddd", marginTop: 4 },

  distanceBadge: {
    alignSelf: "flex-start",
    marginTop: 6,
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  distanceText: { color: "#fff", fontSize: 10 },

  ownProfileBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  ownProfileText: { color: "#fff", fontSize: 10 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  profileModalCard: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 20,
    alignItems: "center",
  },
  profileModalImage: { width: "100%", height: 260, borderRadius: 20 },
  profileModalName: { fontSize: 22, marginTop: 14, fontWeight: "bold" },
  profileModalJob: { fontSize: 14, color: COLORS.MUTED, marginVertical: 10 },

  profileModalActions: {
    flexDirection: "row",
    width: "100%",
    gap: 10,
    marginTop: 10,
  },

  modalLikeBtn: {
    width: 50,
    height: 50,
    backgroundColor: "#EF4444",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },

  modalViewBtn: {
    flex: 1,
    height: 50,
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },

  modalViewText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  modalCloseText: { marginTop: 14, color: COLORS.MUTED },
});
