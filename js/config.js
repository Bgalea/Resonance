/**
 * Gallery Configuration
 * Defines the groups of images and their associated audio.
 */
const galleryConfig = {
  groups: [
    {
      id: "group1",
      // Local nature sound
      audioSrc: "assets/groups/group1/group1.ogg",
      images: [
        {
          id: "g1-img1",
          src: "assets/groups/group1/g1-img1.jpg",
          caption: "Serene Nature - View 1"
        },
        {
          id: "g1-img2",
          src: "assets/groups/group1/g1-img2.jpg",
          caption: "Serene Nature - View 2"
        },
        {
          id: "g1-img3",
          src: "assets/groups/group1/g1-img3.jpg",
          caption: "Serene Nature - View 3"
        }
      ]
    },
    {
      id: "group2",
      // Local ambient sound
      audioSrc: "assets/groups/group2/group2.ogg",
      images: [
        {
          id: "g2-img1",
          src: "assets/groups/group2/g2-img1.jpg",
          caption: "Urban Life - View 1"
        },
        {
          id: "g2-img2",
          src: "assets/groups/group2/g2-img2.jpg",
          caption: "Urban Life - View 2"
        }
      ]
    }
  ],
  // Audio settings
  crossfadeDuration: 2000 // ms
};
