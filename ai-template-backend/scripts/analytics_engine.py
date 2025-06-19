# analytics_engine.py
import pandas as pd
import json
import sys
import os
from datetime import datetime, timedelta

# Helper function to convert Excel-like integer dates or string dates to datetime.date objects
def parse_date_column(series, excel_origin='1899-12-30'):
    # Attempt to convert numeric types first (Excel dates)
    numeric_dates = pd.to_numeric(series, errors='coerce')
    is_numeric = pd.notna(numeric_dates)
    
    # Convert numeric to datetime
    converted_dates = pd.to_datetime(numeric_dates[is_numeric], unit='D', origin=excel_origin, errors='coerce')
    
    # For non-numeric (strings), convert directly
    string_dates = pd.to_datetime(series[~is_numeric], errors='coerce')
    
    # Combine and ensure NaT where conversion failed
    final_dates = pd.Series(index=series.index, dtype='datetime64[ns]')
    final_dates[is_numeric] = converted_dates
    final_dates[~is_numeric] = string_dates
    
    return final_dates.dt.date # Return only the date part, NaT if failed

class ReportAnalyticsEngine:
    def __init__(self, file_paths: dict):
        self.dataframes = self._load_data(file_paths)
        self._preprocess_data()

    def _load_data(self, file_paths: dict) -> dict:
        dataframes = {}
        for name, path in file_paths.items():
            try:
                # print(f"DEBUG: Attempting to load: {path}") # Uncomment for very verbose loading
                dataframes[name] = pd.read_csv(path)
                # print(f"DEBUG: Successfully loaded: {name}.csv, Shape: {dataframes[name].shape}") # Uncomment for verbose loading
            except FileNotFoundError:
                print(json.dumps({"error": f"Python Error: File not found at {path} (during _load_data)"}))
            except Exception as e:
                print(json.dumps({"error": f"Python Error: Could not load {path}: {e}"}))
        return dataframes

    def _preprocess_data(self):
        # Licenses DataFrame
        if 'licenses' in self.dataframes:
            df = self.dataframes['licenses'].copy() # Work on a copy
            # FIX for FutureWarning: Avoid chained assignment with inplace=True
            df['licenseStatus'] = df['licenseStatus'].fillna('Active')
            df['issueDate_dt'] = parse_date_column(df['issueDate'])
            df['expiryDate_dt'] = parse_date_column(df['expiryDate'])
            self.dataframes['licenses'] = df
        else:
            print(json.dumps({"error": "Python Error: licenses.csv is required for preprocessing but not loaded."}))

        # Incidents DataFrame
        if 'incidents' in self.dataframes:
            df = self.dataframes['incidents'].copy() # Work on a copy
            df['incident_date_dt'] = pd.to_datetime(df['incident_date'], errors='coerce').dt.tz_localize(None).dt.date
            self.dataframes['incidents'] = df
        else:
            print(json.dumps({"warning": "Python Warning: incidents.csv not loaded, incident-related metrics may fail."}))

        # Submissions DataFrame
        if 'submissions' in self.dataframes:
            df = self.dataframes['submissions'].copy() # Work on a copy
            df['dueDate_dt'] = parse_date_column(df['dueDate'])
            df['submissionDate_dt'] = parse_date_column(df['submissionDate'])
            self.dataframes['submissions'] = df
        else:
            print(json.dumps({"warning": "Python Warning: submissions.csv not loaded, submission-related metrics may fail."}))
        
        if 'entities' not in self.dataframes:
             print(json.dumps({"error": "Python Error: entities.csv is required but not loaded."}))
        if 'categories' not in self.dataframes:
             print(json.dumps({"error": "Python Error: categories.csv is required but not loaded."}))

    def _get_entity_ids_in_category(self, category_id: str, current_date: datetime.date) -> list:
        categories_df = self.dataframes.get('categories')
        licenses_df = self.dataframes.get('licenses')

        if categories_df is None or licenses_df is None:
            print("Error: categories_df or licenses_df is None in _get_entity_ids_in_category")
            return []

        # Robust check for category_id
        category_info = categories_df[categories_df['ID'].astype(str).str.strip() == str(category_id).strip()]
        if category_info.empty:
            print(f"Error in _get_entity_ids_in_category: Category ID '{str(category_id).strip()}' not found after stripping spaces. Available IDs in loaded categories.csv: {list(categories_df['ID'].astype(str).str.strip().unique())}")
            return []
        
        category_name_keyword = category_info.iloc[0]['Name'].split(' ')[0].lower()

        # Ensure issueDate_dt and expiryDate_dt are present from preprocessing
        if 'issueDate_dt' not in licenses_df.columns or 'expiryDate_dt' not in licenses_df.columns:
            print("Error: issueDate_dt or expiryDate_dt columns are missing from licenses_df. Preprocessing might have failed.")
            return []

        active_licenses_in_category = licenses_df[
            (licenses_df['licenseType'].str.lower().str.contains(category_name_keyword, na=False)) &
            (licenses_df['licenseStatus'] == 'Active') & 
            (licenses_df['issueDate_dt'] <= current_date) &
            ((licenses_df['expiryDate_dt'].isnull()) | (licenses_df['expiryDate_dt'] > current_date))
        ]
        return active_licenses_in_category['entityId'].unique().tolist()

    def get_total_active_entities(self, category_id: str, current_date: datetime.date) -> dict:
        entity_ids = self._get_entity_ids_in_category(category_id, current_date)
        return {"displayType": "scalar", "data": len(entity_ids)}

    def get_new_licenses_last_year(self, category_id: str, current_date: datetime.date) -> dict:
        categories_df = self.dataframes.get('categories')
        licenses_df = self.dataframes.get('licenses')

        if categories_df is None or licenses_df is None:
            return {"displayType": "scalar", "data": "Error: Missing category or license data"}

        category_info = categories_df[categories_df['ID'].astype(str).str.strip() == str(category_id).strip()]
        if category_info.empty:
            return {"displayType": "scalar", "data": "N/A - Category ID not found"}
        
        category_name_keyword = category_info.iloc[0]['Name'].split(' ')[0].lower()
        one_year_ago_date = current_date - timedelta(days=365)

        if 'issueDate_dt' not in licenses_df.columns:
            print("Error: issueDate_dt column missing from licenses_df for get_new_licenses_last_year.")
            return {"displayType": "scalar", "data": "Error: Data processing issue"}

        new_licenses = licenses_df[
            (licenses_df['licenseType'].str.lower().str.contains(category_name_keyword, na=False)) &
            (licenses_df['issueDate_dt'].notnull()) &
            (licenses_df['issueDate_dt'] > one_year_ago_date) &
            (licenses_df['issueDate_dt'] <= current_date)
        ]
        return {"displayType": "scalar", "data": new_licenses['licenseId'].nunique()}

    def get_entities_with_high_severity_incidents(self, category_id: str, current_date: datetime.date) -> dict:
        incidents_df = self.dataframes.get('incidents')
        if incidents_df is None:
            return {"displayType": "scalar", "data": "Error: Missing incident data"}
        if 'incident_date_dt' not in incidents_df.columns:
            print("Error: incident_date_dt column missing from incidents_df for get_entities_with_high_severity_incidents.")
            return {"displayType": "scalar", "data": "Error: Data processing issue"}


        entity_ids_in_category = self._get_entity_ids_in_category(category_id, current_date)
        if not entity_ids_in_category: 
            return {"displayType": "scalar", "data": 0} 

        ninety_days_ago_date = current_date - timedelta(days=90)
        
        high_severity_incidents = incidents_df[
            (incidents_df['entityId'].isin(entity_ids_in_category)) &
            (incidents_df['severity'].isin(['High', 'Significant'])) &
            (incidents_df['incident_date_dt'].notnull()) &
            (incidents_df['incident_date_dt'] > ninety_days_ago_date) &
            (incidents_df['incident_date_dt'] <= current_date)
        ]
        return {"displayType": "scalar", "data": high_severity_incidents['entityId'].nunique()}

    def get_entities_with_overdue_submissions(self, category_id: str, current_date: datetime.date) -> dict:
        submissions_df = self.dataframes.get('submissions')
        if submissions_df is None:
            return {"displayType": "scalar", "data": "Error: Missing submission data"}
        if 'dueDate_dt' not in submissions_df.columns or 'submissionDate_dt' not in submissions_df.columns:
            print("Error: date columns missing from submissions_df for get_entities_with_overdue_submissions.")
            return {"displayType": "scalar", "data": "Error: Data processing issue"}

        entity_ids_in_category = self._get_entity_ids_in_category(category_id, current_date)
        if not entity_ids_in_category:
            return {"displayType": "scalar", "data": 0}

        overdue_submissions = submissions_df[
            (submissions_df['entityId'].isin(entity_ids_in_category)) &
            (submissions_df['submissionDate_dt'].isnull()) & 
            (submissions_df['dueDate_dt'].notnull()) &
            (submissions_df['dueDate_dt'] < current_date) &
            (submissions_df['status'] != 'Cancelled') 
        ]
        return {"displayType": "scalar", "data": overdue_submissions['entityId'].nunique()}

if __name__ == '__main__':
    # Special debug mode: run with "debug_first_category" as the first argument
    if len(sys.argv) > 1 and sys.argv[1] == 'debug_first_category':
        print("--- RUNNING IN DEBUG MODE for the first category found in categories.csv ---")
        
        script_dir_debug = os.path.dirname(os.path.abspath(__file__))
        file_paths_for_debug = {
            name: os.path.join(script_dir_debug, f'{name}.csv') 
            for name in ["applications", "categories", "documents", "entities", 
                         "incidents", "licenses", "persons", "products", 
                         "reports", "staff", "submissions"]
        }

        try:
            engine = ReportAnalyticsEngine(file_paths_for_debug)
        except Exception as e:
            print(f"Error initializing ReportAnalyticsEngine in debug mode: {e}")
            sys.exit(1)
        
        if 'categories' not in engine.dataframes or engine.dataframes['categories'].empty:
            print("CRITICAL: categories.csv was not loaded or is empty. Aborting debug.")
            sys.exit(1)
        
        categories_df_debug = engine.dataframes['categories']
        if 'ID' not in categories_df_debug.columns or 'Name' not in categories_df_debug.columns:
            print("CRITICAL: 'ID' or 'Name' column missing in categories.csv. Aborting debug.")
            print("Columns found:", categories_df_debug.columns)
            sys.exit(1)

        first_category_id = categories_df_debug['ID'].astype(str).str.strip().iloc[0]
        first_category_name = categories_df_debug['Name'].astype(str).str.strip().iloc[0]
        print(f"Using first category for debug: ID='{first_category_id}', Name='{first_category_name}'")
            
        debug_category_id = first_category_id
        debug_current_date_str = '2025-06-04' # You can change this date if needed for testing
        try:
            debug_current_date_obj = datetime.strptime(debug_current_date_str, "%Y-%m-%d").date()
        except ValueError:
            print(f"Error: Invalid date format for debug_current_date. Expected YYYY-MM-DD, got {debug_current_date_str}")
            sys.exit(1)

        print(f"\n--- Debugging _get_entity_ids_in_category for '{debug_category_id}' as of {debug_current_date_obj} ---")
        
        category_info_debug = categories_df_debug[categories_df_debug['ID'].astype(str).str.strip() == debug_category_id]
        category_name_keyword_debug = category_info_debug.iloc[0]['Name'].split(' ')[0].lower()
        print(f"Category Name Keyword: '{category_name_keyword_debug}'")
        
        if 'licenses' not in engine.dataframes:
            print("CRITICAL: licenses.csv was not loaded. Aborting further license debug.")
            sys.exit(1)
        licenses_df_debug = engine.dataframes['licenses']

        print("\nRelevant columns from licenses.csv (after preprocessing):")
        relevant_license_cols = ['licenseId', 'entityId', 'licenseType', 'issueDate', 'expiryDate', 'licenseStatus', 'issueDate_dt', 'expiryDate_dt']
        
        # Filter to show only potential matches by type for brevity and relevance
        potential_matches_df = licenses_df_debug[licenses_df_debug['licenseType'].str.lower().str.contains(category_name_keyword_debug, na=False)]
        print("Potential matches by licenseType (showing relevant columns):")
        print(potential_matches_df[relevant_license_cols].to_string()) # Using to_string() to see all rows if many
        print("-" * 30)

        print("\n--- Applying Filters Step-by-Step ---")
        type_match_filter = licenses_df_debug['licenseType'].str.lower().str.contains(category_name_keyword_debug, na=False)
        status_active_filter = licenses_df_debug['licenseStatus'] == 'Active' # Assumes 'Active' is the correct target status
        issue_date_valid_filter = licenses_df_debug['issueDate_dt'] <= debug_current_date_obj
        expiry_date_ok_filter = (licenses_df_debug['expiryDate_dt'].isnull()) | (licenses_df_debug['expiryDate_dt'] > debug_current_date_obj)
        
        combined_filter_debug = (type_match_filter & status_active_filter & issue_date_valid_filter & expiry_date_ok_filter)
        print(f"ALL conditions met (final combined filter): {combined_filter_debug.sum()} license rows")
        
        active_licenses_in_category_debug_df = licenses_df_debug[combined_filter_debug]
        print("\nLicenses passing ALL filters (final selection):")
        print(active_licenses_in_category_debug_df[relevant_license_cols].to_string())
        
        final_entity_ids = active_licenses_in_category_debug_df['entityId'].unique().tolist()
        print(f"\nUnique Entity IDs found from final selection: {len(final_entity_ids)}")
        print(f"Entity IDs: {sorted(final_entity_ids)}")

        print("\n--- Calling original _get_entity_ids_in_category function for comparison ---")
        original_result_ids = engine._get_entity_ids_in_category(debug_category_id, debug_current_date_obj)
        print(f"Original function _get_entity_ids_in_category result IDs: {sorted(original_result_ids)}")
        print(f"Original function count: {len(original_result_ids)}")

        print("\n--- Testing other metrics with this category ---")
        print(f"Total Active Entities: {engine.get_total_active_entities(debug_category_id, debug_current_date_obj)}")
        print(f"New Licenses Last Year: {engine.get_new_licenses_last_year(debug_category_id, debug_current_date_obj)}")
        print(f"Entities w/ High Severity Incidents: {engine.get_entities_with_high_severity_incidents(debug_category_id, debug_current_date_obj)}")
        print(f"Entities w/ Overdue Submissions: {engine.get_entities_with_overdue_submissions(debug_category_id, debug_current_date_obj)}")


    # Original script execution logic if not in debug mode
    elif len(sys.argv) < 4:
        print(json.dumps({"error": "Python Error: Missing arguments. Expected metric_name, category_id, current_date_YYYY-MM-DD or 'debug_first_category'"}))
        sys.exit(1)
    else:
        metric_to_call = sys.argv[1]
        category_id_arg = sys.argv[2]
        current_date_str_arg = sys.argv[3]

        try:
            current_date_obj = datetime.strptime(current_date_str_arg, "%Y-%m-%d").date()
        except ValueError:
            print(json.dumps({"error": f"Python Error: Invalid date format for current_date. Expected YYYY-MM-DD, got {current_date_str_arg}"}))
            sys.exit(1)

        script_dir = os.path.dirname(os.path.abspath(__file__))
        file_paths_for_python = {
            name: os.path.join(script_dir, f'{name}.csv') 
            for name in ["applications", "categories", "documents", "entities", 
                         "incidents", "licenses", "persons", "products", 
                         "reports", "staff", "submissions"]
        }
        
        try:
            engine = ReportAnalyticsEngine(file_paths_for_python)
            result = {}

            if metric_to_call == "totalActiveEntities":
                result = engine.get_total_active_entities(category_id_arg, current_date_obj)
            elif metric_to_call == "newLicensesLastYear":
                result = engine.get_new_licenses_last_year(category_id_arg, current_date_obj)
            elif metric_to_call == "entitiesWithHighSeverityIncidents":
                result = engine.get_entities_with_high_severity_incidents(category_id_arg, current_date_obj)
            elif metric_to_call == "entitiesWithOverdueSubmissions":
                result = engine.get_entities_with_overdue_submissions(category_id_arg, current_date_obj)
            else:
                result = {"error": f"Python Error: Unknown metric function '{metric_to_call}'"}
            
            # Ensure only the JSON result is printed to stdout for Node.js
            print(json.dumps(result))
        except Exception as e:
            print(json.dumps({"error": f"Python Error: An unexpected error occurred: {str(e)}"}))
            sys.exit(1)