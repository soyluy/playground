package soyluy.nerisa;

import java.time.LocalDate;
import java.time.temporal.WeekFields;

public class WeekService {
	
	public static Week getNextWeek() {
		LocalDate date = LocalDate.now().plusWeeks(1);
		return getWeek(date);
	}

	public static Week getNextWeek(Week week){
		return getWeek(week.start().plusWeeks(1));
	}

	public static Week getPreviousWeek() {
		LocalDate date = LocalDate.now().minusWeeks(1);
		return getWeek(date);
	}

	public static Week getPreviousWeek(Week week){
		return getWeek(week.start().minusWeeks(1));
	}

	public static Week getThisWeek(){
		LocalDate date = LocalDate.now();
		return getWeek(date);
	}
	
	public static Week getWeek(LocalDate date){
		return new Week(
			getWeekOfYear(date), 
			date.get(WeekFields.ISO.weekBasedYear()), 
			getStartOfWeek(date), 
			getEndOfWeek(date)
		);
	}
	
	private static int getWeekOfYear(LocalDate date){
		return date.get(WeekFields.ISO.weekOfWeekBasedYear());
	}

	private static LocalDate getStartOfWeek(LocalDate date){
		return date.with(WeekFields.ISO.dayOfWeek(), 1);
	}

	private static LocalDate getEndOfWeek(LocalDate date){
		return date.with(WeekFields.ISO.dayOfWeek(), 7);
	}

}
