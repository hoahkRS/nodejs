const Note = require("./note.model");
const R = require("../common/response");

async function create(req, res) {
  try {
    const { title, body } = req.body || {};
    const owner = req.user?.id;
    const note = new Note({ title, body, owner });
    // const saved = await note.save();
    // loop 10 items to create sample notes for testing pagination
    for (let i = 0; i < 10; i++) {
      const sampleNote = new Note({
        title: `${title} ${i + 1}`,
        body: `${body} - Sample ${i + 1}`,
        owner,
      });
      await sampleNote.save();
    }
    return R.success(res, {}, "Note created successfully", 201);
    // return R.success(res, saved, 'Note created successfully', 201);
  } catch (err) {
    console.error("create error:", err);
    return R.error(res, "Internal server error", 500);
  }
}

async function show(req, res) {
  try {
    const { id } = req.params;
    const note = await Note.findOne({ _id: id, owner: req.user?.id });
    if (!note) {
      return R.error(res, "Note not found", 404);
    }
    return R.success(res, note);
  } catch (err) {
    console.error("show error:", err);
    return R.error(res, "Internal server error", 500);
  }
}

async function get(req, res) {
  try {
    const owner = req.user?.id;
    const {
      limit = 10,
      page = 1,
      sortBy = "createdAt",
      sortType = "desc",
    } = req.query || {};
    const skip = (page - 1) * limit;
    const direction = String(sortType).toLowerCase() === "asc" ? 1 : -1;
    const sort = { [sortBy]: direction, _id: direction };

    const items = await Note.find({ owner }).sort(sort).skip(skip).limit(limit);

    return R.success(res, items);
  } catch (err) {
    console.error("get error:", err);
    return R.error(res, "Internal server error", 500);
  }
}

async function update(req, res) {
  try {
    const { id } = req.params;
    const payload = {};
    if (Object.prototype.hasOwnProperty.call(req.body || {}, "title"))
      payload.title = req.body.title;
    if (Object.prototype.hasOwnProperty.call(req.body || {}, "body"))
      payload.body = req.body.body;

    const updated = await Note.findOneAndUpdate(
      { _id: id, owner: req.user?.id },
      payload,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!updated) {
      return R.error(res, "Note not found", 404);
    }
    return R.success(res, updated, "Note updated successfully");
  } catch (err) {
    console.error("update error:", err);
    return R.error(res, "Internal server error", 500);
  }
}

async function destroy(req, res) {
  try {
    const { id } = req.params;
    const deleted = await Note.findOneAndDelete({
      _id: id,
      owner: req.user?.id,
    });
    if (!deleted) {
      return R.error(res, "Note not found", 404);
    }
    return R.success(res, null, "Note deleted successfully");
  } catch (err) {
    console.error("destroy error:", err);
    return R.error(res, "Internal server error", 500);
  }
}

module.exports = { create, get, show, update, destroy };
