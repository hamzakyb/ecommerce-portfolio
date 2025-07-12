import { Link } from "react-router-dom";
import "./CategoryItem.css";

const CategoryItem = ({ category }) => {
  return (
    <Link to={`/maincategory/${category?._id}`} className="category-item">
      <img src={category?.img} alt="" />
      <span>{category?.name}</span>
    </Link>
  );
};

export default CategoryItem;
