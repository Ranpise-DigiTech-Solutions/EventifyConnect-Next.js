import {
  SearchBar,
  Packages,
  Promotion,
  Destinations,
  AboutUs,
  Blogs,
  Stories,
} from "@/components/pages/home";

export default function HomePage() {
  return (
    <>
      <Promotion />
      <Destinations />
      <SearchBar />
      <Packages />
      <AboutUs />
      <Stories />
      <Blogs />
    </>
  );
}
