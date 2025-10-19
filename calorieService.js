const axios = require("axios");

/**
 * HÀM DỊCH: Dịch tiếng Việt -> tiếng Anh
 * Dùng API MyMemory (free, không cần đăng ký)
 */
async function translateToEnglish(text) {
    try {
        const res = await axios.get("https://api.mymemory.translated.net/get", {
            params: {
                q: text,
                langpair: "vi|en",
            },
        });

        return res.data?.responseData?.translatedText || text;
    } catch (error) {
        console.error("Lỗi dịch:", error.message);
        return text; // fallback nếu lỗi
    }
}

/**
 * HÀM TÍNH CALO
 * Dịch danh sách nguyên liệu, gọi Edamam API để tính calo
 */
async function calculateCalories(foodName, ingredients) {
    const app_id = "b54fddcd";
    const app_key = "649126fe285492385da05796177ac554";

    try {
        // Dịch từng nguyên liệu sang tiếng Anh để gửi Edamam
        const translatedIngredients = await Promise.all(
            ingredients.map(async (i) => {
                const translatedName = await translateToEnglish(`${i.quantity} ${i.name}`);
                return {
                    viName: i.name,
                    enName: translatedName,
                    quantity: i.quantity,
                };
            })
        );

        // Chuẩn bị danh sách nguyên liệu dịch sang tiếng Anh cho Edamam
        const ingrList = translatedIngredients.map((i) => i.enName);

        // Gọi API Edamam Nutrition Analysis
        const res = await axios.post(
            `https://api.edamam.com/api/nutrition-details?app_id=${app_id}&app_key=${app_key}`,
            {
                title: foodName,
                ingr: ingrList,
            },
            { headers: { "Content-Type": "application/json" } }
        );

        const data = res.data;

        // Tổng calo toàn món
       // 🔹 Tính tổng dinh dưỡng
        let nutrients = {};
        if (data.ingredients && data.ingredients.length > 0) {
            data.ingredients.forEach((ingredient) => {
                const parsed = ingredient.parsed?.[0];
                if (parsed && parsed.nutrients) {
                    Object.entries(parsed.nutrients).forEach(([key, value]) => {
                        if (nutrients[key]) { nutrients[key] += value.quantity; }
                        else { nutrients[key] = value.quantity; }
                    });
                }
            });
        }

        // Lấy calo theo từng nguyên liệu (nếu Edamam trả về chi tiết)
        const caloriesPerIngredient = data.ingredients?.map((ing, index) => {
            const kcal = ing.parsed?.[0]?.nutrients?.ENERC_KCAL?.quantity || 0;
            return {
                viName: translatedIngredients[index].viName,
                // enName: translatedIngredients[index].enName,
                quantity: translatedIngredients[index].quantity,
                calories: kcal,
            };
        }) || [];

        return {
            name: foodName, // giữ nguyên tiếng Việt
            caloriesPerIngredient,
            nutrients,
            
        };

    } catch (error) {
        console.error("Lỗi tính calo:", error.response?.data || error.message);
        return null;
    }
}

module.exports = { calculateCalories };
