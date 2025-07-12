import React from 'react';
import "./Reviews.css";
import ReviewForm from './ReviewForm';
import ReviewItem from './ReviewItem';
import PropTypes from 'prop-types';

const Reviews = ({ active, singleProduct, setSingleProduct }) => {
  return (
    <div className={`tab-panel-reviews ${active}`}>
      {singleProduct && singleProduct.reviews.length > 0 ? (
        <>
          <h3>Filtreler için inceleme</h3>
          <div className="comments">
            <ol className="comment-list">
              {singleProduct.reviews.map((item, index) => (
                <ReviewItem key={index} item={item} reviewItem={item} />
                ))}
            </ol>
          </div>
        </>
      ) : (
        <h3>Hiç yorum yok...</h3>
      )}
      {/* comment form start */}
      <div className="review-form-wrapper">
        <h2>Yorum Ekle</h2>
        <ReviewForm
          singleProduct={singleProduct}
          setSingleProduct={setSingleProduct}
        />      
        </div>
      {/* comment form end */}
    </div>
  );
};

export default Reviews;

Reviews.propTypes = {
  active: PropTypes.string,
  singleProduct: PropTypes.object,
  setSingleProduct: PropTypes.func,
};