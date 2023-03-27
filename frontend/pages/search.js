import Breadcrumb from "@/components/breadcrumb"
import Header from "@/components/header"
import Sidebar from "@/components/sidebar"

function Search() {
  return (
    <>
      <Header />
      <Sidebar currentPage="search" />
      <main id="main" className="main">
        <Breadcrumb name="Search" />
      </main>
    </>
  )
}

export default Search
