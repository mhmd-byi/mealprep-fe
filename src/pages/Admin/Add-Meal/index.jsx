import React from "react";
import { Button, Input } from "../../../components";
import DashboardLayoutComponent from "../../../components/common/Dashboard/Dashboard";
import { Helmet } from "react-helmet";
import useAddMeal from "./useAddMeal";
import IconButton from "@mui/material/IconButton";
import { Add, Delete } from "@mui/icons-material";

const AddMeal = () => {
  const {
    mealData,
    isLoading,
    handleDateChange,
    handleMealTypeChange,
    handleItemChange,
    addNewItem,
    handleSubmit,
    removeItem,
  } = useAddMeal();

  return (
    <DashboardLayoutComponent>
      <Helmet>
        <title>Add Menu | Mealprep</title>
      </Helmet>
      <div className="flex flex-col justify-center items-center p-5 w-full h-full text-left">
        <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-4xl">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">
            Add Menu
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <Input
                  type="date"
                  value={mealData.date}
                  onChange={handleDateChange}
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meal Type
                </label>
                <Input
                  type="select"
                  value={mealData.mealType}
                  onChange={handleMealTypeChange}
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5"
                  placeholder="Select Meal Type"
                  options={[
                    { value: "lunch", label: "Lunch" },
                    { value: "dinner", label: "Dinner" },
                  ]}
                />
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Meal Items
              </h3>
              <div className="max-h-[75vh] overflow-y-auto pr-2">
                {mealData.items.map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-[1fr_1fr_1fr_1fr_10px] gap-4 items-center mb-4 p-4 bg-gray-100 rounded-lg"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Item Name
                      </label>
                      <Input
                        type="text"
                        value={item.name}
                        onChange={(e) =>
                          handleItemChange(index, "name", e.target.value)
                        }
                        placeholder="Meal name"
                        className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <Input
                        type="text"
                        value={item.description}
                        onChange={(e) =>
                          handleItemChange(index, "description", e.target.value)
                        }
                        placeholder="Description"
                        className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Weight
                      </label>
                      <Input
                        type="text"
                        value={item.weight}
                        onChange={(e) =>
                          handleItemChange(index, "weight", e.target.value)
                        }
                        placeholder="Weight"
                        className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type
                      </label>
                      <Input
                        type="select"
                        value={item.type}
                        onChange={(e) =>
                          handleItemChange(index, "type", e.target.value)
                        }
                        className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5"
                        placeholder="Select Meal Type"
                        options={[
                          { value: "Veg", label: "Veg" },
                          { value: "Non Veg", label: "Non Veg" },
                        ]}
                      />
                    </div>
                    <div className="flex items-end justify-center">
                      {index > 0 && (
                        <IconButton
                          onClick={() => removeItem(index)}
                          color="error"
                          className="mt-auto"
                        >
                          <Delete className="mt-5"/>
                        </IconButton>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-start mb-4">
              <button
                type="button"
                onClick={addNewItem}
                className="flex justify-center rounded-md bg-transparent-1 px-5 py-3 text-sm font-semibold leading-6 text-theme-color-1 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 border-2 border-theme-color-1 "
              >
                Add Item
                <Add />
              </button>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
              >
                {isLoading ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayoutComponent>
  );
};

export default AddMeal;
