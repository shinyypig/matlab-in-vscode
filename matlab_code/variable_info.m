function variable_info()
    info = evalin('base', 'whos');

    % Create custom sorting order
    [~, sorted_indices] = sort(upper({info.name}));

    % Rearrange info according to sorted indices
    info = info(sorted_indices);

    % Open the file in the current working directory
    fid = fopen('matlabInVSCodeVariableInfo.csv', 'wt');
    
    if fid == -1
        error('Cannot create CSV file in current directory');
    end

    % Print the headers
    fprintf(fid, 'Name,Value,Class\n');

    % Loop over the variables
    for idx = 1:length(info)
        % Check if the variable size is 1x1 and is numeric or string
        if isequal(info(idx).size, [1 1]) && ((isnumeric(evalin('base', info(idx).name)) || isstring(evalin('base', info(idx).name))))
            try
                value = evalin('base', info(idx).name);
                if ischar(value)
                    value_str = ['''' value ''''];
                else
                    value_str = num2str(value);
                end
            catch
                value_str = '[Error reading value]';
            end
        else
            % Format the size as e.g. "3x4" or "1x5"
            size_dims = info(idx).size;
            if length(size_dims) == 2
                value_str = sprintf('%dx%d', size_dims(1), size_dims(2));
            else
                value_str = strjoin(string(size_dims), 'x');
            end
        end

        % Print the variable information to the file
        fprintf(fid, '%s,%s,%s\n', info(idx).name, value_str, info(idx).class);
    end

    % Close the file
    fclose(fid);
    
    fprintf('Variable info written to: %s\n', fullfile(pwd, 'matlabInVSCodeVariableInfo.csv'));
end
