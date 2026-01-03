import React, { useEffect, useMemo, useState } from 'react';
import FilterIcon from '../../components/common/FilterIcon';
import content from '../../data/content.json';
import Categories from '../../components/Filters/Categories';
import PriceFilter from '../../components/Filters/PriceFilter';
import ColorsFilter from '../../components/Filters/ColorsFilter';
import SizeFilter from '../../components/Filters/SizeFilter';
import ProductCard from './ProductCard';
import { getAllProducts } from '../../api/fetchProducts';
import { useDispatch, useSelector } from 'react-redux';
import { setLoading } from '../../store/features/common';

const categories = content?.categories;

const ProductListPage = ({ categoryType }) => {

  const categoryData = useSelector(state => state?.categoryState?.categories);
  const dispatch = useDispatch();
  const [products, setProducts] = useState([]);

  // Static content mapping
  const categoryContent = useMemo(() => {
    return categories?.find(category => category.code === categoryType);
  }, [categoryType]);

  // Backend category mapping
  const category = useMemo(() => {
    return categoryData?.find(item => item?.code === categoryType);
  }, [categoryData, categoryType]);

  // ✅ FIXED: block API call until category exists
  useEffect(() => {
    if (!category) return;

    dispatch(setLoading(true));

    getAllProducts(category.id)
      .then(res => {
        setProducts(res || []);
      })
      .catch(err => {
        console.error(err);
      })
      .finally(() => {
        dispatch(setLoading(false));
      });

  }, [category, dispatch]);

  return (
    <div>
      <div className="flex">
        
        {/* FILTERS */}
        <div className="w-[20%] p-[10px] border rounded-lg m-[20px]">
          <div className="flex justify-between">
            <p className="text-[16px] text-gray-600">Filter</p>
            <FilterIcon />
          </div>

          <p className="text-[16px] text-black mt-5">Categories</p>
          <Categories types={categoryContent?.types} />
          <hr />

          <PriceFilter />
          <hr />

          <ColorsFilter colors={categoryContent?.meta_data?.colors} />
          <hr />

          <SizeFilter sizes={categoryContent?.meta_data?.sizes} />
        </div>

        {/* PRODUCTS */}
        <div className="p-[15px] w-full">
          <p className="text-black text-lg">{category?.description}</p>

          <div className="pt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-2">
            {products.map((item, index) => (
              <ProductCard
                key={`${item.id}_${index}`}
                {...item}
                title={item.name}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProductListPage;
