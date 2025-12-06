import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS, FONT } from "../../src/constants/theme";

const { width } = Dimensions.get("window");
const COLUMN_WIDTH = width / 2 - 24;

const CATEGORIES = ["All", "Beach", "Mountain", "City", "Camping", "Luxury"];

const EXPLORE_ITEMS = [
  { id: "1", title: "Santorini, Greece", image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=800", likes: "1.2k" },
  { id: "2", title: "Swiss Alps", image: "https://images.unsplash.com/photo-1502920514313-52589602587d?q=80&w=800", likes: "950" },
  { id: "3", title: "Machu Picchu", image: "https://images.unsplash.com/photo-1526392060635-9d6019884377?q=80&w=800", likes: "2.1k" },
  { id: "4", title: "Maldives", image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=800", likes: "3.4k" },
  { id: "5", title: "Kyoto Streets", image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800", likes: "890" },
  { id: "6", title: "Iceland", image: "https://images.unsplash.com/photo-1476610182048-b716b8518aae?q=80&w=800", likes: "1.5k" },
];

export default function ExploreScreen() {
  const [activeCategory, setActiveCategory] = useState("All");

  const renderItem = ({ item, index }: { item: typeof EXPLORE_ITEMS[0]; index: number }) => (
    <TouchableOpacity style={[styles.card, { marginTop: index % 2 === 1 ? 40 : 0 }]} activeOpacity={0.9}>
      <Image source={{ uri: item.image }} style={styles.cardImage} />
      <View style={styles.cardOverlay} />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <View style={styles.cardMeta}>
          <MaterialCommunityIcons name="heart" size={14} color="#fff" />
          <Text style={styles.cardLikes}>{item.likes}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Explore World</Text>
        <TouchableOpacity style={styles.filterBtn}>
          <MaterialCommunityIcons name="tune-vertical" size={24} color={COLORS.TEXT} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={20} color={COLORS.MUTED} style={styles.searchIcon} />
        <TextInput
          placeholder="Where do you want to go?"
          placeholderTextColor={COLORS.MUTED}
          style={styles.searchInput}
        />
      </View>

      {/* Categories */}
      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryChip,
                activeCategory === cat && styles.categoryChipActive,
              ]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text
                style={[
                  styles.categoryText,
                  activeCategory === cat && styles.categoryTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Masonry Grid (Simulated with 2 columns) */}
      <FlatList
        data={EXPLORE_ITEMS}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BG || "#FAFAFA",
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: FONT.UI_BOLD,
    color: COLORS.TEXT,
  },
  filterBtn: {
    padding: 8,
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
  },

  searchContainer: {
    marginHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 54,
    marginBottom: 24,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: FONT.UI_MEDIUM,
    color: COLORS.TEXT,
  },

  categoryScroll: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  categoryChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: "#fff",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  categoryChipActive: {
    backgroundColor: COLORS.TEXT,
    borderColor: COLORS.TEXT,
  },
  categoryText: {
    fontSize: 14,
    fontFamily: FONT.UI_MEDIUM,
    color: COLORS.MUTED,
  },
  categoryTextActive: {
    color: "#fff",
    fontFamily: FONT.UI_BOLD,
  },

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
  card: {
    width: COLUMN_WIDTH,
    height: 240,
    borderRadius: 20,
    marginBottom: 20,
    backgroundColor: "#ccc",
    overflow: "hidden",
    elevation: 3,
  },
  cardImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  cardContent: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: FONT.UI_BOLD,
    color: "#fff",
    marginBottom: 6,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardLikes: {
    fontSize: 12,
    color: "#fff",
    marginLeft: 4,
    fontFamily: FONT.UI_MEDIUM,
  },
});
