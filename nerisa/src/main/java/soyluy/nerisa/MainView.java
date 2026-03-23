package soyluy.nerisa;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.function.Supplier;

import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.control.DatePicker;
import javafx.scene.control.Label;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.VBox;


public class MainView {
	private record DatePreset(String label, Supplier<Week> apply) {}

	private final DateTimeFormatter dtf = DateTimeFormatter.ofPattern("MMM dd");
	
	private final List<DatePreset> presets = List.of(
		new DatePreset("Previous week", WeekService::getPreviousWeek),
		new DatePreset("This week", WeekService::getThisWeek),
		new DatePreset("Next week", WeekService::getNextWeek)
	);

	private final Label weekLabel = new Label();
	private final Label rangeLabel = new Label();
	private DatePicker datePicker;

	public Scene buildScene(){
		BorderPane root = buildRoot();
		Scene s = new Scene(root, 400, 300);
		s.getStylesheets().add(getClass().getResource("/styles.css").toExternalForm());
		datePicker.setValue(LocalDate.now());
		return s;
	}

	// Currently empty, but will be used to switch between apps.
	private HBox buildNavbar(){
		return new HBox();
	}

	private HBox buildPresets(){
		HBox presetsBox = new HBox(10);
		for(DatePreset preset : presets){
			Button btn = new Button(preset.label());
			btn.setOnAction(val -> {
				Week week = preset.apply().get();
				datePicker.setValue(week.start());
			});
			presetsBox.getChildren().add(btn);
		}
		return presetsBox;
	}

	private HBox buildNavigation(){
		HBox nav = new HBox(20);
		Button leftNav = buildLeftNavButton();
		Button rightNav = buildRightNavButton();
		buildDatePicker();
		nav.getChildren().addAll(leftNav, datePicker, rightNav);

		return nav;
	}

	private Button buildLeftNavButton(){
		Button btn = new Button("←");
		btn.setOnAction(val -> {
			Week current = WeekService.getWeek(datePicker.getValue());
			Week previous = WeekService.getPreviousWeek(current);
			datePicker.setValue(previous.start());
		});
		return btn;
	}

	private Button buildRightNavButton(){
		Button btn = new Button("→");
		btn.setOnAction(val -> {
			Week current = WeekService.getWeek(datePicker.getValue());
			Week next = WeekService.getNextWeek(current);
			datePicker.setValue(next.start());
		});
		return btn;
	}

	private DatePicker buildDatePicker(){
		datePicker = new DatePicker();
		datePicker.valueProperty().addListener((obs, oldVal, newVal) -> {
			if(newVal == null){
				weekLabel.setText("");
				rangeLabel.setText("");
				return;
			}
			Week week = WeekService.getWeek(newVal);
			weekLabel.setText("Week " + week.number() + ", " + week.year());
			rangeLabel.setText(dtf.format(week.start()) + " - " + dtf.format(week.end()));
		});
		return datePicker;
	}

	private VBox buildContent(){
		VBox content = new VBox();
		content.getChildren().addAll(
			buildPresets(),
			buildNavigation(),
			weekLabel,
			rangeLabel
		);
		return content;
	}

	private BorderPane buildRoot(){
		BorderPane root = new BorderPane();
		root.setTop(buildNavbar());
		root.setCenter(buildContent());
		return root;
	}
}
