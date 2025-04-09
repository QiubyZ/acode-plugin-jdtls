let parse = {
	title: "Add all missing imports",
	kind: "source",
	diagnostics: [],
	edit: {
		changes: {
			"file:///data/data/com.termux/files/home/Acode/PluginProject/acode-plugin-jdtls/Test/JavaTest.java":
				[
					{
						range: {
							start: { line: 0, character: 12 },
							end: { line: 2, character: 0 },
						},
						newText: "\n\nimport java.util.ArrayList;\n\n",
					},
				],
		},
	},
};

function applyChangesToEditor(changes) {
	const session = editorManager.editor.getSession();

	for (const [uri, edits] of Object.entries(changes)) {
		console.log(`Menerapkan perubahan untuk file: ${uri}`);

		if (!Array.isArray(edits)) {
			console.error(`Perubahan untuk URI ${uri} bukan array:`, edits);
			continue;
		}

		edits.forEach((edit) => {
			const { range, newText } = edit;

			if (!range || typeof newText !== "string") {
				console.error("Perubahan tidak valid:", edit);
				return;
			}

			const startPos = { row: range.start.line, column: range.start.character };
			const endPos = { row: range.end.line, column: range.end.character };

						session.replace(
							{
								start: startPos,
								end: endPos,
							},
							newText,
						);
			console.log("Result StartPost: ", JSON.stringify(startPos.column));
			console.log("Result endPost", JSON.stringify(endPos));

			console.log(
				`Mengganti teks dari posisi ${JSON.stringify(startPos)} ke ${JSON.stringify(
					endPos,
				)} dengan:`,
				newText,
			);
		});
	}
}
applyChangesToEditor(parse.edit);
