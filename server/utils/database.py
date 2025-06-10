async def insert_and_return(collection, data, model):
    result = await collection.insert_one(data)
    data["_id"] = result.inserted_id
    return model.model_validate(data)

async def update_and_return(collection, data, model):
    _id = data["_id"]
    await collection.update_one({"_id": _id}, {"$set": data})
    updated_doc = await collection.find_one({"_id": _id})
    return model.model_validate(updated_doc)

async def delete_and_return(collection, data, model):
    _id = data["_id"]
    await collection.delete_one({"_id": _id})
    deleted_doc = await collection.find_one({"_id": _id})
    return model.model_validate(deleted_doc)
    